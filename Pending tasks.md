Pending tasks

Name is required for sign up
Add preferred languages, one or multiple
Date of Birth, should not show cursor, back button not working properly

Home screen
only show content from selected language always, from every api, it should return the content from selected language

Also for every api 3 scenarios
user is below 18
always filter out Genre and books which is 18+
If the user is 18+ but app locked
always filter out Genre and books which is 18+
If the user is 18+ and app unlocked
do not filter Generes list and books for 18+, show everything
Placeholder to Search stories

In Trending now, create fixed list in backend, also create page on UI, to set the trending books for every language
show 18+ badge for every book, on every screen, including player

Also age condition is apply for downloads also, show downloads if the its unlocked

In below section
All, and each Genre
FOllow the age and lock unlock conditions
DO not change trending now, and continue listning depends on Genere selected, that will be fixed
Show 20 20 books paginated in this section, either all or any other genre
While searching all tab gets activated, and fetch the quesry matching books, this will match only tags (Tags needs to be added in book)

Save all the data in async storage in phone itself, Progress of book, progress of each chapter, liked books, everything needs to be save in async storage
async storage should include name and whatsapp number in key while storing and retriving local data, including Download

Set editors pick book, from UI, save in db
Language wise, 18+ and less than 18, show these depends on user prefered languages and age, and lock unlock

save the lock unlock status in local storage itself,
lock mode will be enabled after inactivity of user 30 mins

feature of Report a book by user

On profile page
SHow name, on whatsapp number show country code differently
user will be able to change whatsapp number, until user will enter opt and verify properly, he will be not shown as verified
Add Terms of use
Delete my account link, small font
APp version has to be from real app version
Listner time listned stories and streak has to be real data, save this in db, update when needed, also don't show 0 numbers initially for new user, SHow some positive text instead of 0hourse, 0 stories and 0d streak
Notifications remove for now

Continue listnng, or listning is not showing

On book details page book title is going up but below the image of book, Book image will fallback to the app logo, on book details and player artwork
chapter sr number will start from 1, not from 0
Start listning button should be little up side
Remove the bookmark feature from music player, seek 10 seconds not proper visible
Remove 3 dots from themusic player
Chapter and speed info section little up side
Mini player is not visible, it has to be there always, if its playing music, only not required on main music screen, mind Start listning button on book details page, make sure bioth button not overrriding each other
If user listnes a book, for at least one minute, then he can able to Rate a book on book details or main music player
Record Book rating(user specific, user can rate a book only once, next time he can update his), and listnes (how many listnes for a book, when user will start listning, it will increase a count, this won't be user specific)
