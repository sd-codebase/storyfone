from __future__ import annotations

import hmac
import random
from datetime import datetime, timezone
from typing import Dict, List, Set

from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException

from db import get_db


async def verify_dev_api_key(
    x_dev_api_key: str = Header(default=""),
) -> None:
    """Validate the X-Dev-API-Key header against the stored key."""
    db = get_db()
    doc = await db.api_keys.find_one({"name": "dev_seed"})
    if not doc or not hmac.compare_digest(x_dev_api_key, doc["key"]):
        raise HTTPException(403, "Invalid or missing dev API key")


router = APIRouter(
    prefix="/api/v1/dev",
    tags=["dev-seed"],
    dependencies=[Depends(verify_dev_api_key)],
)


# ---------------------------------------------------------------------------
# Helpers to collect real asset URLs from existing processed data
# ---------------------------------------------------------------------------

async def _collect_real_urls(db) -> Dict[str, List[str]]:
    """Scan existing books/chapters for real thumbnail & HLS URLs to reuse."""
    book_thumbs: List[str] = []
    book_hls: List[str] = []
    ch_thumbs: List[str] = []
    ch_hls: List[str] = []

    async for doc in db.books.find(
        {"_mock": {"$ne": True}, "is_published": True},
        {"thumbnail_url": 1, "preview_audio_hls": 1},
    ):
        if doc.get("thumbnail_url"):
            book_thumbs.append(doc["thumbnail_url"])
        if doc.get("preview_audio_hls"):
            book_hls.append(doc["preview_audio_hls"])

    async for doc in db.chapters.find(
        {"_mock": {"$ne": True}, "is_published": True},
        {"thumbnail_url": 1, "audio_hls": 1},
    ):
        if doc.get("thumbnail_url"):
            ch_thumbs.append(doc["thumbnail_url"])
        if doc.get("audio_hls"):
            ch_hls.append(doc["audio_hls"])

    return {
        "book_thumbs": book_thumbs,
        "book_hls": book_hls,
        "ch_thumbs": ch_thumbs,
        "ch_hls": ch_hls,
    }

# ---------------------------------------------------------------------------
# 100 realistic Hindi/Marathi audio-drama titles + descriptions
# ---------------------------------------------------------------------------

BOOK_POOL: List[Dict[str, str]] = [
    {"title": "अंधेरी गली", "desc": "मुंबई की अंधेरी गलियों में छिपे रहस्य और खतरनाक सच्चाई की कहानी।"},
    {"title": "रात का साया", "desc": "एक पुरानी हवेली में रात के अंधेरे में घटती अजीब घटनाओं की दहशत भरी दास्तान।"},
    {"title": "खामोश गवाह", "desc": "एक हत्या का इकलौता गवाह जो बोल नहीं सकता — एक पालतू कुत्ता।"},
    {"title": "लाल पत्थर", "desc": "राजस्थान के रेगिस्तान में दबे एक प्राचीन खजाने की खोज।"},
    {"title": "काला पानी", "desc": "अंडमान की सेलुलर जेल से भागने की एक कैदी की दिल दहला देने वाली कोशिश।"},
    {"title": "धुंध के पार", "desc": "हिमालय की धुंध भरी वादियों में खो गई एक ट्रैकिंग टीम की कहानी।"},
    {"title": "आखिरी स्टेशन", "desc": "एक रहस्यमय ट्रेन जो किसी नक्शे पर न मिलने वाले स्टेशन पर रुकती है।"},
    {"title": "सन्नाटे की चीख", "desc": "एक बंद पड़े अस्पताल से आती अजीब आवाजों की जांच।"},
    {"title": "जहर", "desc": "एक सफल बिजनेसमैन की रहस्यमय मौत और उसके परिवार के काले रहस्य।"},
    {"title": "दोपहर का भूत", "desc": "गांव में दोपहर को दिखने वाली एक स्त्री की आत्मा की लोककथा।"},
    {"title": "गुमनाम खत", "desc": "हर हफ्ते आने वाले गुमनाम खतों ने एक परिवार की नींद उड़ा दी।"},
    {"title": "तीसरी मंजिल", "desc": "एक अपार्टमेंट की तीसरी मंजिल पर कोई नहीं रहता — पर रोशनी जलती है।"},
    {"title": "बेनाम रिश्ता", "desc": "दो अजनबियों की ऑनलाइन दोस्ती जो एक खतरनाक मोड़ ले लेती है।"},
    {"title": "छाया", "desc": "अपनी ही परछाई से डरने वाले एक आदमी की मनोवैज्ञानिक थ्रिलर।"},
    {"title": "खंडहर", "desc": "गोवा के एक पुर्तगाली खंडहर में दबी प्रेम कहानी।"},
    {"title": "काला जादू", "desc": "बंगाल के एक गांव में तांत्रिक अनुष्ठानों की भयावह दास्तान।"},
    {"title": "दूसरा चेहरा", "desc": "एक शांत स्कूल टीचर की दोहरी जिंदगी का पर्दाफाश।"},
    {"title": "मौत का कुआं", "desc": "एक सूखे कुएं में मिलती हैं सदियों पुरानी हड्डियां और एक श्राप।"},
    {"title": "आग का दरिया", "desc": "विभाजन की त्रासदी में बिछड़े दो भाइयों की कहानी।"},
    {"title": "नीला मकान", "desc": "हर किरायेदार जो उस नीले मकान में रहा, उसके साथ कुछ अजीब हुआ।"},
    {"title": "रक्त बीज", "desc": "एक खानदानी श्राप जो हर पीढ़ी में एक की जान लेता है।"},
    {"title": "गुमशुदा", "desc": "एक बच्ची के लापता होने से शुरू होती है एक छोटे शहर की काली सच्चाई।"},
    {"title": "काली नदी", "desc": "नदी किनारे बसे गांव में हर बरसात में होती है एक रहस्यमय मौत।"},
    {"title": "पागलखाना", "desc": "एक मानसिक अस्पताल के मरीज की डायरी से निकलती भयानक सच्चाई।"},
    {"title": "चुड़ैल का पेड़", "desc": "गांव के बरगद पर रात को बैठती है एक औरत — सच या अंधविश्वास?"},
    {"title": "आईना", "desc": "एक पुराने आईने में दिखता है भविष्य — पर हर बार कुछ बदल जाता है।"},
    {"title": "लापता ट्रेन", "desc": "1947 में लाहौर से दिल्ली आने वाली एक ट्रेन जो कभी नहीं पहुंची।"},
    {"title": "सातवां दरवाजा", "desc": "एक किले के सात दरवाजे — सातवें के पीछे क्या है, कोई नहीं जानता।"},
    {"title": "अदृश्य", "desc": "एक वैज्ञानिक का प्रयोग गलत हो जाता है और वह अदृश्य हो जाता है।"},
    {"title": "मकड़ी का जाल", "desc": "एक सीरियल किलर जो अपने शिकार को जाल बिछाकर फंसाता है।"},
    {"title": "भूलभुलैया", "desc": "लखनऊ की एक पुरानी इमारत की भूलभुलैया में फंसे लोगों की कहानी।"},
    {"title": "प्यासी आत्मा", "desc": "रेगिस्तान में भटकती एक प्यासी आत्मा मुसाफिरों को रास्ता भटकाती है।"},
    {"title": "जंगल की पुकार", "desc": "सुंदरबन के जंगलों में खो गए एक फोटोग्राफर की जिंदगी और मौत की जंग।"},
    {"title": "अंतिम गवाही", "desc": "कोर्ट में एक मरते हुए आदमी की आखिरी गवाही पलट देती है पूरा केस।"},
    {"title": "रूह", "desc": "एक लड़की जो मरने के बाद भी अपने कातिल को ढूंढ रही है।"},
    {"title": "शापित हवेली", "desc": "तीन दोस्त एक शापित हवेली में रात बिताने की शर्त लगाते हैं।"},
    {"title": "खूनी होली", "desc": "होली के रंगों में छिपा एक पुराना बदला।"},
    {"title": "काला सच", "desc": "एक पत्रकार को मिलती है एक पेनड्राइव जो सत्ता की नींव हिला दे।"},
    {"title": "बारिश की रात", "desc": "एक तूफानी रात में एक अजनबी दरवाजा खटखटाता है।"},
    {"title": "विष कन्या", "desc": "प्राचीन भारत की विष कन्या की कथा — प्यार और विश्वासघात।"},
    {"title": "मृत्यु लोक", "desc": "मौत के बाद की दुनिया का एक काल्पनिक चित्रण।"},
    {"title": "चोर बाजार", "desc": "मुंबई के चोर बाजार में बिकती है एक चोरी हुई पेंटिंग जिसमें छिपा है नक्शा।"},
    {"title": "ब्लैकआउट", "desc": "पूरे शहर में अचानक बिजली गुल — और अंधेरे में शुरू होता है खेल।"},
    {"title": "कफन", "desc": "एक मुर्दे को कफन ओढ़ाते वक्त दिखता है कि वह मरा नहीं है।"},
    {"title": "चीखें", "desc": "एक रिकॉर्डिंग स्टूडियो में कैद होती हैं अनसुनी चीखें।"},
    {"title": "पहेली", "desc": "एक बूढ़े प्रोफेसर की मौत के बाद मिलती है एक पहेली — जो सुलझाएगा, उसे मिलेगी विरासत।"},
    {"title": "सांप सीढ़ी", "desc": "जिंदगी का खेल जहां एक गलत कदम सब छीन सकता है।"},
    {"title": "डरावना सपना", "desc": "हर रात वही सपना — और सपने में जो होता है, अगले दिन सच होता है।"},
    {"title": "मायानगरी", "desc": "बॉलीवुड की चमक-दमक के पीछे की काली दुनिया।"},
    {"title": "जिंदा लाश", "desc": "एक आदमी जिसे सब मरा समझते हैं, अचानक लौट आता है।"},
    {"title": "अभिशाप", "desc": "एक मंदिर से चुराई मूर्ति ने पूरे परिवार को अभिशाप दे दिया।"},
    {"title": "कातिल कौन", "desc": "एक बंद कमरे में हत्या — सबके पास मौका था, पर कातिल कौन?"},
    {"title": "प्रेत योनि", "desc": "एक तांत्रिक की अधूरी साधना से मुक्त हुई प्रेत आत्माएं।"},
    {"title": "शिकारी", "desc": "शिकार करने गए चार दोस्त खुद शिकार बन जाते हैं।"},
    {"title": "रहस्य द्वीप", "desc": "समुद्र में एक अनजान द्वीप पर फंसे लोगों की सर्वाइवल कहानी।"},
    {"title": "मुखौटा", "desc": "हर इंसान एक मुखौटा पहनता है — पर इस शहर में मुखौटे जिंदा हैं।"},
    {"title": "आत्मा का बदला", "desc": "एक निर्दोष की हत्या के बाद उसकी आत्मा लेती है बदला।"},
    {"title": "धोखा", "desc": "सबसे करीबी दोस्त ने दिया सबसे बड़ा धोखा — एक क्राइम थ्रिलर।"},
    {"title": "वापसी", "desc": "20 साल बाद एक आदमी लौटता है अपने गांव — पर गांव बदल चुका है।"},
    {"title": "अंधेरा उजाला", "desc": "एक अंधे संगीतकार की आवाज में छिपा है एक राज।"},
    {"title": "कब्रिस्तान", "desc": "कब्रिस्तान की चौकीदारी करने वाले बूढ़े की आपबीती।"},
    {"title": "तलाश", "desc": "एक रिटायर्ड पुलिस अफसर अपने बेटे के कातिल की तलाश में।"},
    {"title": "भयानक रात", "desc": "जंगल में कैंपिंग के दौरान एक-एक करके गायब होते लोग।"},
    {"title": "चांदनी रात", "desc": "पूर्णिमा की रात बदल जाता है एक शांत गांव।"},
    {"title": "जासूस", "desc": "एक डबल एजेंट की कहानी जो दो देशों के बीच फंसा है।"},
    {"title": "काली रात का रहस्य", "desc": "अमावस्या की रात शुरू होता है एक खतरनाक अनुष्ठान।"},
    {"title": "डायरी", "desc": "एक पुरानी डायरी में लिखी कहानी जिंदा हो उठती है।"},
    {"title": "साया", "desc": "एक औरत को लगता है कोई उसका पीछा कर रहा है — पर कोई दिखता नहीं।"},
    {"title": "हवा महल", "desc": "जयपुर के हवा महल में छिपी एक राजकुमारी की अनकही दास्तान।"},
    {"title": "नरभक्षी", "desc": "चंपावत की आदमखोर बाघिन और जिम कॉर्बेट की शिकार कहानी।"},
    {"title": "भूतिया बंगला", "desc": "एक सस्ते बंगले का राज — जो भी रहता है, भाग जाता है।"},
    {"title": "ठगी", "desc": "19वीं सदी के ठग जो मुसाफिरों को लूटते और मारते थे।"},
    {"title": "आंधी", "desc": "एक राजनीतिक आंधी में फंसे एक ईमानदार अफसर की कहानी।"},
    {"title": "कालापानी", "desc": "एक मछुआरा जो समुद्र में जाता है और लौटता है बदला हुआ।"},
    {"title": "स्मृति", "desc": "याददाश्त खोने के बाद एक औरत को पता चलता है कि उसकी पूरी जिंदगी झूठ थी।"},
    {"title": "रक्तपात", "desc": "एक छोटे शहर में लगातार हो रही हत्याओं की श्रृंखला।"},
    {"title": "अग्निपथ", "desc": "एक लड़के का अपराध की दुनिया से निकलकर इंसाफ पाने का सफर।"},
    {"title": "बंदिश", "desc": "एक संगीत घराने पर लगी बंदिश — जो गाएगा, वो मरेगा।"},
    {"title": "चक्रव्यूह", "desc": "भ्रष्टाचार के चक्रव्यूह में फंसा एक व्हिसलब्लोअर।"},
    {"title": "मोहिनी", "desc": "एक रहस्यमय सुंदरी जो जिसे भी मिलती है, उसकी किस्मत बदल देती है।"},
    {"title": "खदान", "desc": "झारखंड की एक बंद खदान में फंसे मजदूरों की सर्वाइवल कहानी।"},
    {"title": "ग्रहण", "desc": "सूर्य ग्रहण के दिन शुरू होती है एक अलौकिक घटनाओं की श्रृंखला।"},
    {"title": "पातालपुर", "desc": "जमीन के नीचे बसी एक गुप्त सभ्यता की खोज।"},
    {"title": "बलिदान", "desc": "एक सैनिक की कहानी जिसने देश के लिए सब कुछ दांव पर लगा दिया।"},
    {"title": "सुरंग", "desc": "एक पुरानी सुरंग जो दो अलग ज़मानों को जोड़ती है।"},
    {"title": "भस्म", "desc": "एक गांव अचानक जलकर राख हो जाता है — कोई गवाह नहीं।"},
    {"title": "नागमणि", "desc": "नागमणि की खोज में निकले लोगों की रोमांचक और भयावह यात्रा।"},
    {"title": "पिशाच", "desc": "एक वायरस इंसानों को पिशाच बना रहा है — क्या है इलाज?"},
    {"title": "अपहरण", "desc": "एक उद्योगपति के बेटे का अपहरण और 48 घंटे की डेडलाइन।"},
    {"title": "सफेद कब्र", "desc": "एक सफेद कब्र जो हर साल एक इंच बढ़ती है।"},
    {"title": "जुनून", "desc": "प्यार का जुनून जो हद से गुजर जाए तो बन जाता है खतरा।"},
    {"title": "काला बाजार", "desc": "मुंबई के अंडरवर्ल्ड में हथियारों की तस्करी का खतरनाक जाल।"},
    {"title": "वीराना", "desc": "एक वीरान गांव जहां 100 साल से कोई नहीं रहता — पर आवाजें आती हैं।"},
    {"title": "मंत्र", "desc": "एक प्राचीन मंत्र जो मरे हुओं को जिंदा कर सकता है।"},
    {"title": "षड्यंत्र", "desc": "सत्ता के लिए रचा गया एक षड्यंत्र — कौन है शिकार, कौन शिकारी?"},
    {"title": "निशान", "desc": "हर शव पर एक ही निशान — पुलिस हैरान, शहर दहशत में।"},
    {"title": "काल सर्प", "desc": "एक नाग देवता के मंदिर में छिपा रहस्य और खजाना।"},
    {"title": "अंजान राहें", "desc": "एक अनजान शहर, अनजान लोग — और एक खतरनाक गेम।"},
    {"title": "डाकू रानी", "desc": "चंबल की एक महिला डाकू की सच्ची कहानी — शोषण से विद्रोह तक।"},
    {"title": "मृगतृष्णा", "desc": "जो दिखता है वो है नहीं — एक मरीचिका जो जान ले लेती है।"},
    {"title": "कुहासा", "desc": "कुहासे में लिपटा एक पहाड़ी शहर जहां लोग गायब हो रहे हैं।"},
]

DESCRIPTION_POOL: List[str] = [d["desc"] for d in BOOK_POOL]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/seed")
async def seed_mock_data():
    """Create 100 mock books with 5-20 chapters each using real DB entities."""

    db = get_db()

    # Fetch real entities from DB
    genres = await db.genres.find().to_list(500)
    languages = await db.languages.find().to_list(500)
    authors = await db.authors.find().to_list(500)
    narrators = await db.narrators.find().to_list(500)

    if not genres or not languages or not authors or not narrators:
        raise HTTPException(
            400,
            "Seed the admin entities first (genres, languages, authors, narrators)",
        )

    # Collect real asset URLs from existing processed books/chapters
    real_urls = await _collect_real_urls(db)
    if not real_urls["ch_hls"]:
        raise HTTPException(
            400,
            "No processed chapters found. Upload and process at least one real "
            "book+chapter before seeding so mock data can reuse its audio/thumbnails.",
        )

    # Build set of adult genre IDs for deriving is_adult
    adult_genre_ids: Set[str] = {
        str(g["_id"]) for g in genres if g.get("is_adult")
    }

    now = datetime.now(timezone.utc).isoformat()

    books_to_insert: List[dict] = []
    chapters_to_insert: List[dict] = []

    for i, entry in enumerate(BOOK_POOL):
        book_oid = ObjectId()
        book_id_str = str(book_oid)

        # Pick random entities
        book_genres = random.sample(
            [str(g["_id"]) for g in genres],
            k=min(random.randint(1, 3), len(genres)),
        )
        book_authors = random.sample(
            [str(a["_id"]) for a in authors],
            k=min(random.randint(1, 2), len(authors)),
        )
        book_narrator = [str(random.choice(narrators)["_id"])]
        book_language = str(random.choice(languages)["_id"])

        is_adult = bool(adult_genre_ids & set(book_genres))

        book_doc = {
            "_id": book_oid,
            "title": entry["title"],
            "description": entry["desc"],
            "language": book_language,
            "genres": book_genres,
            "authors": book_authors,
            "narrators": book_narrator,
            "is_adult": is_adult,
            "is_published": True,
            "thumbnail_url": random.choice(real_urls["book_thumbs"]) if real_urls["book_thumbs"] else None,
            "preview_audio_raw": None,
            "preview_audio_hls": random.choice(real_urls["book_hls"]) if real_urls["book_hls"] else None,
            "audio_status": "processed",
            "_mock": True,
            "created_at": now,
            "updated_at": now,
        }
        books_to_insert.append(book_doc)

        # Generate chapters for this book
        num_chapters = random.randint(5, 20)
        for ch_idx in range(1, num_chapters + 1):
            ch_doc = {
                "_id": ObjectId(),
                "name": "Chapter %d" % ch_idx,
                "book_id": book_id_str,
                "order": ch_idx - 1,
                "status": "processed",
                "is_published": True,
                "thumbnail_url": random.choice(real_urls["ch_thumbs"]) if real_urls["ch_thumbs"] else None,
                "audio_raw": None,
                "audio_hls": random.choice(real_urls["ch_hls"]),
                "_mock": True,
                "created_at": now,
                "updated_at": now,
            }
            chapters_to_insert.append(ch_doc)

    # Bulk insert
    await db.books.insert_many(books_to_insert)
    await db.chapters.insert_many(chapters_to_insert)

    return {
        "books_created": len(books_to_insert),
        "chapters_created": len(chapters_to_insert),
    }


@router.delete("/seed")
async def cleanup_mock_data():
    """Delete all documents tagged with _mock=True."""

    db = get_db()

    chapters_result = await db.chapters.delete_many({"_mock": True})
    books_result = await db.books.delete_many({"_mock": True})

    return {
        "books_deleted": books_result.deleted_count,
        "chapters_deleted": chapters_result.deleted_count,
    }
