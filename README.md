# Board Game Geek Importer
Imports board game details from [BoardGameGeek.com's XML API](https://boardgamegeek.com/wiki/page/BGG_XML_API2)
into a local MySql database. Useful for local analysis and research.

# Data Terms of Use
See Board Game Geeks [XML API Terms of Use](https://boardgamegeek.com/wiki/page/BGG_XML_API2)

# Setup
* Create a local MySql databasa and import Schema.sql for table schemas
* Checkout the repository and run

  ```shell
  npm install
  node main
  ```
* Wait, it can take several hours to download

# Tables
**bg_games** will be the primary table with all the basic game data. All links for games (artists, publisher,
category, game mechanics, etc.) are stored as seperate tables with a mapping table to establish the
many-to-many relationships between them and games.
