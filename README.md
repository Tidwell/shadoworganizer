#Shadow Organizer

##TODO
	FE
		- reporting opponent
		- chat (directives? chat-pane & chat-users? pub/sub to chatId set with directive, update model? can it use scope?)
		- user popup
			-username, in-game name, (rating), report button-dropdown (unsportsmanship, cheating, inactive)

		- finished/spectate view (allows chat in running tournaments?)
		- general chat
		- user profiles (account view without the settings)
		- running tournament status on tournaments screen
		- help/faq page


		//- rating leaderboard


	FE->BE
		- all service calls from controllers
		- socket.io integration (replace TODO in services and add pubsub)

	BE
		tournament notifications

		match notifications

		game notifications

		chat notifications (channels)
			player readys
			game / match result
			user join / drop
			end / winner
			chat de-activates 10 mins after tournament end
			tournament start



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

faq / tutorial


##Pipe dreams

Sealed (3d support through the godstcg engine)

Draft (3d support through the godstcg engine)
