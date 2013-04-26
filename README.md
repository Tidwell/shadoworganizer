#Shadow Organizer

##TODO
	FE
		- reporting opponent
		- chat
		- service calls from other controllers
		- socket.io integration (replace TODO in services and add pubsub)

	BE
		everything...


 ##objective

	Fully automated Creation of 8-man single-elimination tournaments (constructed)
	Automated Crystal Transfer Email for prize sending
	Automated Matchmaking (game password)
	Best of 3 Deck Lock, 2nd game loser goes first


##social

	Chat (general)
	Chat (tournament)
	Chat (game for matchmaking)

IRC notifications to #shadowera? https://github.com/martynsmith/node-irc


##misc necessities

	Result reporting tool (First Turn Reminder)
	 -resolution for saying different ppl went first and for forgot who went first
	  - differences, 2 min in chat to resolve - then random
	  - forgot, use opponent, both forgot, random

Game result reporting disagreement, 2 min in chat to resolve, 5 min to get main chat to resolve
	 -only one player enters, other disconnected, assume correct
	 -only one player enters, 5 min for other to confirm

Reporting tools for unsportsmanship, cheating (deck modification, innacuracy)

Drop button

Report player non-responsive button (results in drop after 5 mins)

Report disconnected button (adds flag, X disconnects and investigate/block) - replay game

Service auto-detect disconnect and show warnings to other players (after 10 mins, drop)

Service auto-reconnect



##after launch

Allow creating tournaments with prize-request email generation and alternate rules
(hero lock, sideboard, etc)

Audio and Title bar notifications

Better responsiveness (Remove sign in from dropdown, item ordering, etc)

##Pipe dreams

Sealed (3d support through the godstcg engine)

Draft (3d support through the godstcg engine)
