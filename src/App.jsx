import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Activity, DollarSign, Plus, Trash2, RefreshCw, Zap, Filter, AlertTriangle } from 'lucide-react';

// ─── Roster lookup by team abbreviation ─────────────────────────────────────
const TEAM_DATA = {
  MEM: {
    name: "Memphis", color: "#5D76A9", record: "12-14",
    starters: [{ name: "Ja Morant", pos: "PG", ppg: 22.1, fg: 47.2, status: "DD" }, { name: "Cedric Coward", pos: "SG", ppg: 10.4, fg: 44.8, status: "Active" }, { name: "Jaylen Wells", pos: "SF", ppg: 9.7, fg: 43.5, status: "Active" }, { name: "Santi Aldama", pos: "PF", ppg: 11.2, fg: 46.0, status: "Active" }, { name: "Jaren Jackson Jr.", pos: "C", ppg: 17.8, fg: 48.5, status: "Active" }],
    bench: [{ name: "Vince Williams Jr.", pos: "SG", ppg: 8.2, fg: 41.0, status: "Active" }, { name: "KCP", pos: "SF", ppg: 6.8, fg: 38.5, status: "Active" }, { name: "Jock Landale", pos: "C", ppg: 5.1, fg: 52.0, status: "Active" }, { name: "Cam Spencer", pos: "PG", ppg: 7.4, fg: 43.0, status: "OUT" }]
  },
  PHI: {
    name: "Philadelphia", color: "#006BB6", record: "34-30",
    starters: [{ name: "Cameron Payne", pos: "PG", ppg: 9.4, fg: 42.1, status: "Active", note: "Maxey OUT" }, { name: "VJ Edgecombe", pos: "SG", ppg: 8.6, fg: 44.3, status: "Active" }, { name: "Kelly Oubre Jr.", pos: "SF", ppg: 12.2, fg: 44.8, status: "Active" }, { name: "Dominick Barlow", pos: "PF", ppg: 7.1, fg: 50.2, status: "Active" }, { name: "Adem Bona", pos: "C", ppg: 6.8, fg: 58.5, status: "Active", note: "Embiid OUT" }],
    bench: [{ name: "Quentin Grimes", pos: "SG", ppg: 11.4, fg: 41.8, status: "Active" }, { name: "Jabari Walker", pos: "PF", ppg: 6.2, fg: 46.0, status: "Active" }, { name: "Kyle Lowry", pos: "PG", ppg: 5.0, fg: 38.2, status: "Active" }, { name: "Justin Edwards", pos: "SF", ppg: 5.5, fg: 42.0, status: "Active" }]
  },
  DET: {
    name: "Detroit", color: "#C8102E", record: "45-18",
    starters: [{ name: "Cade Cunningham", pos: "PG", ppg: 26.3, fg: 46.8, status: "Active" }, { name: "Duncan Robinson", pos: "SG", ppg: 14.2, fg: 44.1, status: "Active" }, { name: "Javonte Green", pos: "SF", ppg: 8.5, fg: 52.0, status: "Active", note: "Ausar OUT" }, { name: "Tobias Harris", pos: "PF", ppg: 16.8, fg: 50.2, status: "Active" }, { name: "Jalen Duren", pos: "C", ppg: 14.5, fg: 61.0, status: "Active" }],
    bench: [{ name: "Ronald Holland II", pos: "SF", ppg: 9.2, fg: 44.0, status: "Active" }, { name: "Isaiah Stewart", pos: "PF", ppg: 8.8, fg: 49.0, status: "Active" }, { name: "Kevin Huerter", pos: "SG", ppg: 10.2, fg: 43.5, status: "Active" }, { name: "Daniss Jenkins", pos: "PG", ppg: 5.6, fg: 42.0, status: "Active" }]
  },
  BKN: {
    name: "Brooklyn", color: "#000000", record: "7-19",
    starters: [{ name: "Egor Demin", pos: "PG", ppg: 9.8, fg: 41.0, status: "Active" }, { name: "Terance Mann", pos: "SG", ppg: 11.4, fg: 47.5, status: "Active" }, { name: "Michael Porter Jr.", pos: "SF", ppg: 16.2, fg: 47.8, status: "Active" }, { name: "Noah Clowney", pos: "PF", ppg: 8.9, fg: 48.0, status: "Active" }, { name: "Nic Claxton", pos: "C", ppg: 12.4, fg: 61.5, status: "Active" }],
    bench: [{ name: "Nolan Traore", pos: "PG", ppg: 7.2, fg: 39.5, status: "Active" }, { name: "Ziaire Williams", pos: "SF", ppg: 9.4, fg: 43.0, status: "Active" }, { name: "Day'Ron Sharpe", pos: "C", ppg: 6.8, fg: 55.0, status: "Active" }, { name: "Danny Wolf", pos: "PF", ppg: 5.1, fg: 47.0, status: "Active" }]
  },
  DAL: {
    name: "Dallas", color: "#00538C", record: "21-42",
    starters: [{ name: "Brandon Williams", pos: "PG", ppg: 14.8, fg: 45.0, status: "Active", note: "Flagg DD" }, { name: "Max Christie", pos: "SG", ppg: 12.5, fg: 44.2, status: "Active" }, { name: "Khris Middleton", pos: "SF", ppg: 14.2, fg: 46.8, status: "Active" }, { name: "PJ Washington", pos: "PF", ppg: 13.4, fg: 48.5, status: "Active" }, { name: "Daniel Gafford", pos: "C", ppg: 11.8, fg: 65.2, status: "Active" }],
    bench: [{ name: "Cooper Flagg", pos: "PG/SF", ppg: 17.2, fg: 46.5, status: "DD" }, { name: "Klay Thompson", pos: "SG", ppg: 11.8, fg: 42.0, status: "Active" }, { name: "Caleb Martin", pos: "SF", ppg: 8.5, fg: 46.0, status: "Active" }, { name: "Naji Marshall", pos: "SF", ppg: 7.7, fg: 44.0, status: "Active" }]
  },
  ATL: {
    name: "Atlanta", color: "#E03A3E", record: "33-31",
    starters: [{ name: "Dyson Daniels", pos: "PG", ppg: 14.8, fg: 44.5, status: "Active" }, { name: "Nickeil Alexander-Walker", pos: "SG", ppg: 12.6, fg: 43.2, status: "Active" }, { name: "Zaccharie Risacher", pos: "SF", ppg: 11.4, fg: 43.8, status: "Active" }, { name: "Jalen Johnson", pos: "PF", ppg: 22.7, fg: 50.2, status: "Active" }, { name: "Onyeka Okongwu", pos: "C", ppg: 14.2, fg: 58.5, status: "Active" }],
    bench: [{ name: "CJ McCollum", pos: "PG", ppg: 17.4, fg: 46.2, status: "Active" }, { name: "Jonathan Kuminga", pos: "SF", ppg: 13.8, fg: 48.0, status: "Active" }, { name: "Corey Kispert", pos: "SF", ppg: 9.2, fg: 39.5, status: "Active" }, { name: "Buddy Hield", pos: "SG", ppg: 10.4, fg: 42.0, status: "Active" }]
  },
  WAS: {
    name: "Washington", color: "#002B5C", record: "16-41",
    starters: [{ name: "Bub Carrington", pos: "PG", ppg: 11.2, fg: 42.5, status: "Active" }, { name: "Tre Johnson", pos: "SG", ppg: 13.8, fg: 44.0, status: "Active" }, { name: "Will Riley", pos: "SF", ppg: 8.4, fg: 41.5, status: "Active", note: "George OUT" }, { name: "Marvin Bagley III", pos: "PF", ppg: 9.2, fg: 52.0, status: "Active" }, { name: "Alex Sarr", pos: "C", ppg: 12.5, fg: 49.5, status: "Active" }],
    bench: [{ name: "Sharife Cooper", pos: "PG", ppg: 7.4, fg: 41.0, status: "Active" }, { name: "Jaden Hardy", pos: "SG", ppg: 9.8, fg: 42.5, status: "Active" }, { name: "Trae Young", pos: "PG", ppg: 24.8, fg: 44.0, status: "OUT" }, { name: "Anthony Davis", pos: "C", ppg: 24.7, fg: 56.0, status: "OUT" }]
  },
  MIA: {
    name: "Miami", color: "#98002E", record: "36-29",
    starters: [{ name: "Davion Mitchell", pos: "PG", ppg: 11.8, fg: 44.2, status: "Active" }, { name: "Tyler Herro", pos: "SG", ppg: 22.4, fg: 44.8, status: "DD" }, { name: "Jaime Jaquez Jr.", pos: "SF", ppg: 11.5, fg: 46.5, status: "Active", note: "Powell/Wiggins OUT" }, { name: "Simone Fontecchio", pos: "PF", ppg: 9.8, fg: 44.0, status: "Active" }, { name: "Bam Adebayo", pos: "C", ppg: 21.2, fg: 54.5, status: "Active" }],
    bench: [{ name: "Kasparas Jakucionis", pos: "PG", ppg: 8.8, fg: 41.5, status: "Active" }, { name: "Pelle Larsson", pos: "SG", ppg: 7.2, fg: 43.0, status: "Active" }, { name: "Kel'el Ware", pos: "C", ppg: 9.5, fg: 58.0, status: "OUT" }, { name: "Vladislav Goldin", pos: "C", ppg: 5.4, fg: 56.0, status: "Active" }]
  },
  PHX: {
    name: "Phoenix", color: "#E56020", record: "37-27",
    starters: [{ name: "Collin Gillespie", pos: "PG", ppg: 9.5, fg: 43.5, status: "Active" }, { name: "Devin Booker", pos: "SG", ppg: 27.4, fg: 48.2, status: "Active" }, { name: "Jalen Green", pos: "SF", ppg: 21.8, fg: 45.5, status: "Active" }, { name: "Royce O'Neale", pos: "PF", ppg: 9.8, fg: 44.0, status: "Active" }, { name: "Oso Ighodaro", pos: "C", ppg: 8.5, fg: 55.0, status: "Active" }],
    bench: [{ name: "Grayson Allen", pos: "SG", ppg: 12.2, fg: 42.5, status: "DD" }, { name: "Jordan Goodwin", pos: "PG", ppg: 7.8, fg: 44.0, status: "Active" }, { name: "Ryan Dunn", pos: "SF", ppg: 8.5, fg: 46.0, status: "Active" }, { name: "Khaman Maluach", pos: "C", ppg: 6.2, fg: 58.0, status: "Active" }]
  },
  MIL: {
    name: "Milwaukee", color: "#00471B", record: "23-30",
    starters: [{ name: "Kevin Porter Jr.", pos: "PG", ppg: 14.8, fg: 43.5, status: "Active", note: "Rollins OUT" }, { name: "Cam Thomas", pos: "SG", ppg: 18.6, fg: 43.8, status: "Active" }, { name: "AJ Green", pos: "SF", ppg: 11.4, fg: 42.5, status: "Active" }, { name: "Giannis Antetokounmpo", pos: "PF", ppg: 28.2, fg: 58.5, status: "Active" }, { name: "Myles Turner", pos: "C", ppg: 16.5, fg: 52.0, status: "Active" }],
    bench: [{ name: "Gary Trent Jr.", pos: "SG", ppg: 14.2, fg: 43.0, status: "Active" }, { name: "Ousmane Dieng", pos: "SF", ppg: 9.0, fg: 44.0, status: "Active" }, { name: "Bobby Portis", pos: "PF", ppg: 11.5, fg: 48.0, status: "Active" }, { name: "Kyle Kuzma", pos: "PF", ppg: 10.8, fg: 45.5, status: "Active" }]
  },
  TOR: {
    name: "Toronto", color: "#CE1141", record: "17-12",
    starters: [{ name: "Immanuel Quickley", pos: "PG", ppg: 18.5, fg: 44.2, status: "Active" }, { name: "Brandon Ingram", pos: "SG", ppg: 21.5, fg: 46.8, status: "Active" }, { name: "Ochai Agbaji", pos: "SF", ppg: 11.2, fg: 43.5, status: "Active", note: "Barrett OUT" }, { name: "Scottie Barnes", pos: "PF", ppg: 20.8, fg: 49.5, status: "Active" }, { name: "Jakob Poeltl", pos: "C", ppg: 14.2, fg: 62.0, status: "DD" }],
    bench: [{ name: "Gradey Dick", pos: "SG", ppg: 9.5, fg: 40.8, status: "Active" }, { name: "Ja'Kobe Walter", pos: "SG", ppg: 8.8, fg: 42.0, status: "Active" }, { name: "Collin Murray-Boyles", pos: "PF", ppg: 7.4, fg: 50.0, status: "Active" }, { name: "Jamal Shead", pos: "PG", ppg: 6.2, fg: 41.5, status: "Active" }]
  },
  HOU: {
    name: "Houston", color: "#CE1141", record: "39-24",
    starters: [{ name: "Amen Thompson", pos: "PG", ppg: 18.2, fg: 50.5, status: "Active" }, { name: "Josh Okogie", pos: "SG", ppg: 10.8, fg: 45.5, status: "Active" }, { name: "Kevin Durant", pos: "SF", ppg: 27.5, fg: 52.5, status: "Active" }, { name: "Jabari Smith Jr.", pos: "PF", ppg: 14.5, fg: 46.5, status: "Active" }, { name: "Alperen Sengun", pos: "C", ppg: 22.8, fg: 55.0, status: "Active" }],
    bench: [{ name: "Reed Sheppard", pos: "PG", ppg: 9.5, fg: 42.0, status: "Active" }, { name: "Aaron Holiday", pos: "PG", ppg: 7.2, fg: 41.0, status: "Active" }, { name: "Jae'Sean Tate", pos: "SF", ppg: 8.5, fg: 48.0, status: "Active" }, { name: "Cam Whitmore", pos: "SF", ppg: 11.2, fg: 46.0, status: "Active" }]
  },
  BOS: {
    name: "Boston", color: "#007A33", record: "42-21",
    starters: [{ name: "Payton Pritchard", pos: "PG", ppg: 13.8, fg: 34.5, status: "Active", note: "🧊 Cold: 34% FG/6G" }, { name: "Derrick White", pos: "SG", ppg: 15.2, fg: 46.2, status: "Active" }, { name: "Jaylen Brown", pos: "SF", ppg: 23.5, fg: 48.8, status: "Active" }, { name: "Jordan Walsh", pos: "PF", ppg: 8.5, fg: 48.5, status: "DD" }, { name: "Neemias Queta", pos: "C", ppg: 9.8, fg: 60.5, status: "Active" }],
    bench: [{ name: "Anfernee Simons", pos: "PG", ppg: 16.5, fg: 44.2, status: "Active" }, { name: "Baylor Scheierman", pos: "SG", ppg: 9.2, fg: 40.5, status: "Active" }, { name: "Sam Hauser", pos: "SF", ppg: 12.5, fg: 27.1, status: "Active", note: "🧊 Cold: 27% 3PT/3G" }, { name: "Hugo Gonzalez", pos: "SF", ppg: 5.8, fg: 43.0, status: "Active" }]
  },
  SAS: {
    name: "San Antonio", color: "#C4CED4", record: "47-17",
    starters: [{ name: "Stephon Castle", pos: "PG", ppg: 16.2, fg: 46.6, status: "Active" }, { name: "De'Aaron Fox", pos: "SG", ppg: 18.8, fg: 48.4, status: "Active" }, { name: "Devin Vassell", pos: "SF", ppg: 14.4, fg: 44.1, status: "Active" }, { name: "Julian Champagnie", pos: "PF", ppg: 11.4, fg: 43.6, status: "Active" }, { name: "Victor Wembanyama", pos: "C", ppg: 23.8, fg: 50.2, status: "Active", note: "🔥 BLAZING" }],
    bench: [{ name: "Dylan Harper", pos: "PG", ppg: 12.8, fg: 45.0, status: "Active" }, { name: "Blake Wesley", pos: "SG", ppg: 8.5, fg: 42.5, status: "Active" }, { name: "Harrison Barnes", pos: "SF", ppg: 10.2, fg: 46.0, status: "Active" }, { name: "Malaki Branham", pos: "SG", ppg: 9.8, fg: 44.5, status: "Active" }]
  },
  CHA: {
    name: "Charlotte", color: "#1D1160", record: "11-22",
    starters: [{ name: "LaMelo Ball", pos: "PG", ppg: 25.4, fg: 43.8, status: "Active" }, { name: "Kon Knueppel", pos: "SG", ppg: 11.2, fg: 42.0, status: "Active" }, { name: "Brandon Miller", pos: "SF", ppg: 18.5, fg: 45.5, status: "Active" }, { name: "Miles Bridges", pos: "PF", ppg: 16.8, fg: 48.5, status: "DD" }, { name: "Moussa Diabate", pos: "C", ppg: 9.5, fg: 57.0, status: "DD", note: "Kalkbrenner OUT" }],
    bench: [{ name: "Collin Sexton", pos: "PG", ppg: 11.5, fg: 44.0, status: "Active" }, { name: "Josh Green", pos: "SG", ppg: 8.8, fg: 45.0, status: "Active" }, { name: "Tidjane Salaun", pos: "PF", ppg: 7.2, fg: 41.5, status: "Active" }, { name: "PJ Hall", pos: "C", ppg: 8.5, fg: 52.0, status: "Active" }]
  },
  POR: {
    name: "Portland", color: "#E03A3E", record: "31-34",
    starters: [{ name: "Jrue Holiday", pos: "PG", ppg: 12.8, fg: 44.5, status: "DD" }, { name: "Shaedon Sharpe", pos: "SG", ppg: 22.5, fg: 46.8, status: "Active" }, { name: "Toumani Camara", pos: "SF", ppg: 10.8, fg: 48.0, status: "Active" }, { name: "Jerami Grant", pos: "PF", ppg: 16.5, fg: 47.5, status: "Active" }, { name: "Robert Williams", pos: "C", ppg: 9.2, fg: 62.0, status: "Active" }],
    bench: [{ name: "Scoot Henderson", pos: "PG", ppg: 14.8, fg: 43.0, status: "OUT" }, { name: "Caleb Love", pos: "PG", ppg: 8.5, fg: 41.0, status: "Active" }, { name: "Blake Wesley", pos: "SG", ppg: 7.8, fg: 42.0, status: "Active" }, { name: "Deni Avdija", pos: "SF", ppg: 12.5, fg: 45.5, status: "OUT" }]
  },
  IND: {
    name: "Indiana", color: "#002D62", record: "15-49",
    starters: [{ name: "Andrew Nembhard", pos: "PG", ppg: 14.5, fg: 46.5, status: "Active" }, { name: "Quenton Jackson", pos: "SG", ppg: 8.5, fg: 43.0, status: "Active", note: "Sheppard OUT" }, { name: "Bennedict Mathurin", pos: "SF", ppg: 18.8, fg: 45.5, status: "Active" }, { name: "Pascal Siakam", pos: "PF", ppg: 22.2, fg: 50.5, status: "Active" }, { name: "Jay Huff", pos: "C", ppg: 7.5, fg: 58.0, status: "Active" }],
    bench: [{ name: "TJ McConnell", pos: "PG", ppg: 8.8, fg: 50.0, status: "OUT" }, { name: "Jarace Walker", pos: "PF", ppg: 8.2, fg: 47.0, status: "Active" }, { name: "Isaiah Jackson", pos: "C", ppg: 7.5, fg: 58.5, status: "Active" }, { name: "James Wiseman", pos: "C", ppg: 6.8, fg: 56.0, status: "Active" }]
  },
  SAC: {
    name: "Sacramento", color: "#5A2D81", record: "15-50",
    starters: [{ name: "Russell Westbrook", pos: "PG", ppg: 12.5, fg: 43.5, status: "Active" }, { name: "Keon Ellis", pos: "SG", ppg: 9.8, fg: 44.5, status: "Active", note: "LaVine OUT" }, { name: "DeMar DeRozan", pos: "SF", ppg: 18.8, fg: 50.2, status: "Active" }, { name: "Keegan Murray", pos: "PF", ppg: 15.5, fg: 47.5, status: "Active" }, { name: "Maxime Raynaud", pos: "C", ppg: 11.5, fg: 58.5, status: "Active" }],
    bench: [{ name: "Dennis Schroder", pos: "PG", ppg: 12.5, fg: 44.0, status: "Active" }, { name: "Malik Monk", pos: "SG", ppg: 14.2, fg: 43.5, status: "Active" }, { name: "Nique Clifford", pos: "SF", ppg: 7.2, fg: 47.0, status: "Active" }, { name: "Precious Achiuwa", pos: "PF", ppg: 8.5, fg: 52.0, status: "Active" }]
  },
  CHI: {
    name: "Chicago", color: "#CE1141", record: "26-38",
    starters: [{ name: "Tre Jones", pos: "PG", ppg: 14.2, fg: 48.5, status: "Active", note: "Giddey/White OUT" }, { name: "Ayo Dosunmu", pos: "SG", ppg: 12.8, fg: 45.5, status: "Active" }, { name: "Isaac Okoro", pos: "SF", ppg: 10.5, fg: 46.0, status: "Active" }, { name: "Matas Buzelis", pos: "PF", ppg: 14.8, fg: 46.5, status: "Active" }, { name: "Nikola Vucevic", pos: "C", ppg: 18.2, fg: 50.5, status: "Active" }],
    bench: [{ name: "Kevin Huerter", pos: "SG", ppg: 12.5, fg: 42.0, status: "Active" }, { name: "Patrick Williams", pos: "PF", ppg: 9.5, fg: 47.5, status: "Active" }, { name: "Jalen Smith", pos: "PF", ppg: 8.5, fg: 51.0, status: "Active" }, { name: "Dalen Terry", pos: "SF", ppg: 6.5, fg: 44.0, status: "Active" }]
  },
  GSW: {
    name: "Golden State", color: "#FFC72C", record: "32-31",
    starters: [{ name: "Stephen Curry", pos: "PG", ppg: 26.5, fg: 46.8, status: "DD", note: "Minute mgmt" }, { name: "Moses Moody", pos: "SG", ppg: 14.5, fg: 44.5, status: "Active" }, { name: "Jimmy Butler", pos: "SF", ppg: 19.8, fg: 49.5, status: "DD" }, { name: "Draymond Green", pos: "PF", ppg: 9.5, fg: 48.0, status: "Active" }, { name: "Quinten Post", pos: "C", ppg: 11.5, fg: 54.5, status: "Active" }],
    bench: [{ name: "Brandin Podziemski", pos: "PG", ppg: 10.5, fg: 38.5, status: "Active", note: "❄️ Cold" }, { name: "De'Anthony Melton", pos: "SG", ppg: 9.8, fg: 41.5, status: "Active" }, { name: "Trayce Jackson-Davis", pos: "C", ppg: 8.5, fg: 60.5, status: "Active" }, { name: "Buddy Hield", pos: "SG", ppg: 11.5, fg: 40.5, status: "Active" }]
  },
  MIN: {
    name: "Minnesota", color: "#236192", record: "40-24",
    starters: [{ name: "Donte DiVincenzo", pos: "PG", ppg: 14.5, fg: 43.5, status: "Active" }, { name: "Anthony Edwards", pos: "SG", ppg: 29.5, fg: 47.5, status: "Active", note: "🔥 HOT" }, { name: "Jaden McDaniels", pos: "SF", ppg: 16.8, fg: 48.5, status: "Active" }, { name: "Julius Randle", pos: "PF", ppg: 20.5, fg: 49.5, status: "Active" }, { name: "Rudy Gobert", pos: "C", ppg: 12.5, fg: 62.5, status: "Active" }],
    bench: [{ name: "Mike Conley", pos: "PG", ppg: 9.5, fg: 44.5, status: "Active" }, { name: "Bones Hyland", pos: "SG", ppg: 10.5, fg: 42.5, status: "Active" }, { name: "Naz Reid", pos: "C", ppg: 14.8, fg: 49.5, status: "Active" }, { name: "Jaylen Clark", pos: "SF", ppg: 7.5, fg: 46.0, status: "Active" }]
  },
  LAL: {
    name: "LA Lakers", color: "#552583", record: "39-25",
    starters: [{ name: "Luka Doncic", pos: "PG", ppg: 28.8, fg: 48.5, status: "Active", note: "🔥 HOT" }, { name: "Austin Reaves", pos: "SG", ppg: 18.5, fg: 47.5, status: "Active" }, { name: "Marcus Smart", pos: "SF", ppg: 12.5, fg: 44.5, status: "Active" }, { name: "LeBron James", pos: "PF", ppg: 24.5, fg: 52.5, status: "Active", note: "Fatigue mgmt" }, { name: "Deandre Ayton", pos: "C", ppg: 16.5, fg: 60.5, status: "Active" }],
    bench: [{ name: "Rui Hachimura", pos: "SF", ppg: 12.5, fg: 48.5, status: "Active" }, { name: "Jarred Vanderbilt", pos: "PF", ppg: 7.5, fg: 52.0, status: "Active" }, { name: "Jaxson Hayes", pos: "C", ppg: 8.5, fg: 62.0, status: "Active" }, { name: "Luke Kennard", pos: "SG", ppg: 10.5, fg: 45.5, status: "Active" }]
  },
};

// ─── Roster-based team strength ──────────────────────────────────────────────
function teamStrength(rosterData, isHome) {
  if (!rosterData) return isHome ? 53 : 50;
  const all = [...(rosterData.starters || []), ...(rosterData.bench || [])];
  let score = 0;
  all.forEach((p, i) => {
    const w = i < 5 ? 1.0 : 0.4;
    if (p.status === 'OUT') { score -= p.ppg * 0.5 * w; return; }
    const m = p.status === 'DD' ? 0.7 : 1.0;
    score += p.ppg * m * w + (p.fg - 45) * 0.3 * w * m;
    if (p.note?.includes('🔥')) score += 3.5;
    if (p.note?.includes('🧊')) score -= 2.5;
    if (p.note?.includes('❄️')) score -= 1.8;
  });
  if (isHome) score += 3.5;
  return score;
}

// Monte Carlo for any two team abbrs
function runMonteCarlo(awayAbbr, homeAbbr, sims = 300000) {
  const awayData = Object.values(TEAM_DATA).find(t => t.name && awayAbbr && t.name.toLowerCase().includes(awayAbbr.toLowerCase())) || TEAM_DATA[awayAbbr];
  const homeData = Object.values(TEAM_DATA).find(t => t.name && homeAbbr && t.name.toLowerCase().includes(homeAbbr.toLowerCase())) || TEAM_DATA[homeAbbr];
  const aStr = teamStrength(awayData, false);
  const hStr = teamStrength(homeData, true);
  let homeWins = 0;
  for (let i = 0; i < sims; i++) {
    const a = aStr * (0.82 + Math.random() * 0.36) + (Math.random() - 0.5) * 8;
    const h = hStr * (0.82 + Math.random() * 0.36) + (Math.random() - 0.5) * 8;
    if (h > a) homeWins++;
  }
  return homeWins / sims;
}

// Live momentum shift: combines score diff + game progress vs baseline
function computeMomentumShift(espnGame, baselineHomeProb) {
  const state = espnGame?.status?.type?.state;
  if (state !== 'in') return null;
  const home = espnGame.competitions[0].competitors.find(c => c.homeAway === 'home');
  const away = espnGame.competitions[0].competitors.find(c => c.homeAway === 'away');
  const hScore = parseInt(home?.score) || 0;
  const aScore = parseInt(away?.score) || 0;
  const diff = hScore - aScore;
  const period = espnGame.status.period || 1;
  const clock = parseFloat(espnGame.status.displayClock) || 12;
  const progress = Math.min(((period - 1) * 12 + (12 - clock)) / 48, 1);
  // Score diff drives live probability
  const liveFactor = diff * 0.012 * (1 + progress);
  const liveProb = Math.max(0.05, Math.min(0.95, baselineHomeProb + liveFactor));
  const shift = liveProb - baselineHomeProb;
  return { shift, liveProb, diff, period, clock: espnGame.status.displayClock };
}

// Depth impact warning
function getDepthImpact(rosterData) {
  if (!rosterData) return null;
  const outStarters = (rosterData.starters || []).filter(p => p.status === 'OUT');
  if (outStarters.length === 0) return null;
  const ppgLost = outStarters.reduce((acc, p) => acc + p.ppg, 0);
  return { players: outStarters.map(p => p.name), ppgLost: ppgLost.toFixed(1) };
}

// Map abbr to ESPN team abbr (handles mismatches)
function matchRoster(espnAbbr) {
  if (TEAM_DATA[espnAbbr]) return TEAM_DATA[espnAbbr];
  return Object.values(TEAM_DATA).find(t =>
    t.name.toLowerCase().split(' ').some(w => espnAbbr?.toLowerCase().includes(w))
  ) || null;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────
const S = { // shared style tokens
  dot: (c) => ({ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0, display: 'inline-block' }),
  statusColor: { Active: '#22c55e', DD: '#f59e0b', OUT: '#ef4444' },
};

function PlayerRow({ player, isStarter }) {
  const dotColor = S.statusColor[player.status] || '#64748b';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 5,
      background: isStarter ? 'rgba(255,255,255,0.05)' : 'transparent', marginBottom: 2, fontSize: isStarter ? 12 : 11
    }}>
      <span style={{
        width: 32, fontSize: 10, fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,0.06)',
        borderRadius: 3, padding: '1px 3px', textAlign: 'center', flexShrink: 0
      }}>{player.pos}</span>
      <span style={{
        flex: 1, color: player.status === 'OUT' ? '#475569' : isStarter ? '#f1f5f9' : '#94a3b8',
        textDecoration: player.status === 'OUT' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {player.name}
      </span>
      {player.note && player.note.match(/🔥|🧊|❄️/) && (
        <span style={{ fontSize: 11 }}>{player.note.match(/🔥|🧊|❄️/)[0]}</span>
      )}
      <span style={S.dot(dotColor)} />
      <span style={{ fontSize: 10, color: '#64748b', minWidth: 28, textAlign: 'right' }}>{player.ppg}</span>
    </div>
  );
}

function TeamRoster({ rosterData, teamName, color, record }) {
  const [open, setOpen] = useState(false);
  const depthImpact = getDepthImpact(rosterData);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', background: color || '#334155', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff', flexShrink: 0
        }}>
          {teamName?.substring(0, 3).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{teamName}</div>
          {record && <div style={{ fontSize: 10, color: '#64748b' }}>{record}</div>}
        </div>
      </div>
      {depthImpact && (
        <div style={{
          fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 4,
          padding: '2px 6px', marginBottom: 4
        }}>
          ⚠ -{depthImpact.ppgLost} PPG depth ({depthImpact.players.join(', ')} OUT)
        </div>
      )}
      {rosterData ? (
        <>
          {rosterData.starters.map(p => <PlayerRow key={p.name} player={p} isStarter />)}
          <button onClick={() => setOpen(!open)} style={{
            width: '100%', marginTop: 3, padding: '3px 6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5,
            color: '#64748b', fontSize: 10, cursor: 'pointer'
          }}>
            {open ? '▲ Hide Bench' : '▼ Show Bench'}
          </button>
          {open && rosterData.bench.map(p => <PlayerRow key={p.name} player={p} isStarter={false} />)}
        </>
      ) : (
        <div style={{ fontSize: 11, color: '#475569', padding: '8px 0' }}>Roster data loading...</div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
const NBAOddsApp = () => {
  const [games, setGames] = useState([]);
  const [parlay, setParlay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [parlayStake, setParlayStake] = useState(100);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('live');
  const [probs, setProbs] = useState({});
  const [simDone, setSimDone] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [momentum, setMomentum] = useState({});
  const cacheRef = useRef({ data: null, timestamp: null });
  const CACHE_DURATION = 30000;
  const REFRESH_INTERVAL = 45000;

  // Odds from score diff + roster depth
  const generateOdds = useCallback((game) => {
    const homeC = game.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayC = game.competitions[0].competitors.find(c => c.homeAway === 'away');
    const hScore = parseInt(homeC.score) || 0;
    const aScore = parseInt(awayC.score) || 0;
    const diff = hScore - aScore;
    const isLive = game.status.type.state === 'in';
    const isPre = game.status.type.state === 'pre';
    const homeRoster = matchRoster(homeC.team.abbreviation);
    const awayRoster = matchRoster(awayC.team.abbreviation);
    const hStr = teamStrength(homeRoster, true);
    const aStr = teamStrength(awayRoster, false);
    const strDiff = hStr - aStr;
    let homeOdds = -110 + strDiff * 2;
    let awayOdds = -110 - strDiff * 2;
    if (isLive) {
      const period = game.status.period || 1;
      const clock = parseFloat(game.status.displayClock) || 12;
      const progress = Math.min(((period - 1) * 12 + (12 - clock)) / 48, 1);
      const mag = Math.min(Math.abs(diff) * (1 + progress), 40);
      if (diff > 0) { homeOdds = -110 - (mag * 15); awayOdds = 100 + (mag * 20); }
      else if (diff < 0) { awayOdds = -110 - (mag * 15); homeOdds = 100 + (mag * 20); }
    } else if (isPre) {
      homeOdds += Math.random() * 20 - 10;
      awayOdds += Math.random() * 20 - 10;
    }
    const spread = isPre ? strDiff * 0.4 + (Math.random() * 4 - 2) : diff * 0.6;
    return {
      home: Math.round(homeOdds), away: Math.round(awayOdds),
      overUnder: parseFloat((220 + Math.random() * 20 - 10).toFixed(1)),
      spread: parseFloat(spread.toFixed(1)), timestamp: Date.now()
    };
  }, []);

  const fetchGames = useCallback(async (useCache = true) => {
    const cache = cacheRef.current;
    if (useCache && cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      setGames(cache.data); setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.events || data.events.length === 0) {
        setGames([]); setError({ type: 'no_games', message: 'No games scheduled for today' }); setLoading(false); return;
      }
      const enriched = data.events.map(g => ({ ...g, odds: generateOdds(g) }));
      setGames(enriched);
      cacheRef.current = { data: enriched, timestamp: Date.now() };
      setLastUpdate(new Date());
      // Recompute momentum for live games on every refresh
      const newMomentum = {};
      enriched.forEach(g => {
        const homeC = g.competitions[0].competitors.find(c => c.homeAway === 'home');
        const awayC = g.competitions[0].competitors.find(c => c.homeAway === 'away');
        const baseline = probs[g.id];
        if (baseline !== undefined) {
          const shift = computeMomentumShift(g, baseline);
          if (shift) newMomentum[g.id] = shift;
        } else {
          // Estimate baseline from odds if sim not run
          const hOdds = g.odds.home;
          const impliedHome = hOdds < 0 ? Math.abs(hOdds) / (Math.abs(hOdds) + 100) : 100 / (hOdds + 100);
          const shift = computeMomentumShift(g, impliedHome);
          if (shift) newMomentum[g.id] = shift;
        }
      });
      setMomentum(newMomentum);
    } catch (err) {
      setError({ type: 'fetch_error', message: 'Failed to load games. Check your connection.' });
    } finally { setLoading(false); }
  }, [generateOdds, probs]);

  // Auto refresh
  useEffect(() => {
    fetchGames(false);
    let iv;
    if (autoRefresh) iv = setInterval(() => fetchGames(false), REFRESH_INTERVAL);
    return () => { if (iv) clearInterval(iv); };
  }, [autoRefresh, fetchGames]);

  // Monte Carlo sims for all current games
  const runSims = useCallback(async () => {
    setSimRunning(true); setSimProgress(0);
    const results = {};
    for (let i = 0; i < games.length; i++) {
      await new Promise(r => setTimeout(r, 0));
      const g = games[i];
      const homeC = g.competitions[0].competitors.find(c => c.homeAway === 'home');
      const awayC = g.competitions[0].competitors.find(c => c.homeAway === 'away');
      results[g.id] = runMonteCarlo(awayC.team.abbreviation, homeC.team.abbreviation, 300000);
      setSimProgress(Math.round(((i + 1) / games.length) * 100));
    }
    setProbs(results);
    // Update momentum with new baselines
    const newMomentum = {};
    games.forEach(g => {
      const shift = computeMomentumShift(g, results[g.id] ?? 0.5);
      if (shift) newMomentum[g.id] = shift;
    });
    setMomentum(newMomentum);
    setSimDone(true); setSimRunning(false);
  }, [games]);

  // Parlay
  const addToParlay = (game, pick, odds) => {
    const homeC = game.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayC = game.competitions[0].competitors.find(c => c.homeAway === 'away');
    const bet = {
      id: `${game.id}-${pick}`, gameId: game.id, pick, odds,
      homeTeam: homeC.team.displayName, awayTeam: awayC.team.displayName,
      matchup: `${awayC.team.displayName} @ ${homeC.team.displayName}`
    };
    setParlay(prev => {
      const existing = prev.find(p => p.gameId === game.id);
      return existing ? prev.map(p => p.gameId === game.id ? bet : p) : [...prev, bet];
    });
  };
  const removeFromParlay = (id) => setParlay(p => p.filter(x => x.id !== id));
  const clearParlay = () => setParlay([]);

  const calcPayout = () => {
    if (!parlay.length) return { payout: '0.00', profit: '0.00' };
    const totalDec = parlay.reduce((acc, b) => {
      return acc * (b.odds > 0 ? b.odds / 100 + 1 : 100 / Math.abs(b.odds) + 1);
    }, 1);
    return { payout: (parlayStake * totalDec).toFixed(2), profit: (parlayStake * (totalDec - 1)).toFixed(2) };
  };
  const fmt = (o) => o > 0 ? `+${o}` : o;

  const filteredGames = games.filter(g => {
    if (filter === 'live') return g.status.type.state === 'in';
    if (filter === 'upcoming') return g.status.type.state === 'pre';
    return true;
  });

  const autoPickParlay = () => {
    const sorted = [...games].filter(g => probs[g.id] !== undefined)
      .sort((a, b) => Math.abs(probs[b.id] - 0.5) - Math.abs(probs[a.id] - 0.5)).slice(0, 4);
    sorted.forEach(g => {
      const homeC = g.competitions[0].competitors.find(c => c.homeAway === 'home');
      const awayC = g.competitions[0].competitors.find(c => c.homeAway === 'away');
      const homeWin = (probs[g.id] ?? 0.5) > 0.5;
      addToParlay(g, homeWin ? homeC.team.displayName : awayC.team.displayName, homeWin ? g.odds.home : g.odds.away);
    });
  };

  const payoutInfo = calcPayout();
  const liveCount = games.filter(g => g.status.type.state === 'in').length;

  if (loading && !games.length) return (
    <div style={{ minHeight: '100vh', background: '#060d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, border: '4px solid #22c55e', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto'
        }} />
        <p style={{ color: '#22c55e', marginTop: 16, fontWeight: 700, fontSize: 18 }}>Loading Live NBA Data...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#060d1a', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#f1f5f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Space+Grotesk:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
        button:hover{opacity:.88}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg,#0a1628,#060d1a)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 20px 0', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              boxShadow: '0 0 20px rgba(99,102,241,0.4)'
            }}>🏀</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: -.5 }}>
                NBA Live Parlay
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                March 10, 2026 · ESPN Live · Monte Carlo 300K sims
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {liveCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e',
                  background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '4px 10px', border: '1px solid rgba(34,197,94,0.25)'
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                  {liveCount} LIVE
                </div>
              )}
              {!simDone && (
                <button onClick={runSims} disabled={simRunning} style={{
                  padding: '7px 14px',
                  background: simRunning ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: simRunning ? 'not-allowed' : 'pointer'
                }}>
                  {simRunning ? `Simulating ${simProgress}%` : '▶ Run Sims'}
                </button>
              )}
              {simDone && (
                <div style={{ fontSize: 11, color: '#22c55e' }}>✓ Sims done · tap games to parlay</div>
              )}
              <button onClick={() => fetchGames(false)} disabled={loading} style={{
                padding: '7px 12px',
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                color: loading ? '#475569' : '#94a3b8', fontSize: 12, cursor: 'pointer'
              }}>
                {loading ? '⟳' : '↺'} Refresh
              </button>
              <button onClick={() => setAutoRefresh(!autoRefresh)} style={{
                padding: '7px 12px',
                background: autoRefresh ? 'rgba(34,197,94,0.15)' : '#1e293b',
                border: `1px solid ${autoRefresh ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, color: autoRefresh ? '#22c55e' : '#64748b', fontSize: 12, cursor: 'pointer'
              }}>
                {autoRefresh ? 'AUTO ON' : 'AUTO OFF'}
              </button>
            </div>
          </div>
          {simRunning && (
            <div style={{ height: 3, background: '#1e293b', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${simProgress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                borderRadius: 2, transition: 'width 0.3s'
              }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            {[['live', '🔴 Live'], ['rosters', '📋 Rosters'], ['parlay', `💰 Parlay${parlay.length ? ` (${parlay.length})` : ''}`], ['rankings', '📊 Rankings']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '7px 14px', borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: tab === t ? 700 : 500,
                background: tab === t ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer',
                border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                borderBottom: tab === t ? '1px solid #060d1a' : '1px solid transparent',
                color: tab === t ? '#818cf8' : '#64748b', letterSpacing: .3
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 60px' }}>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: 13 }}>
                {error.type === 'no_games' ? 'No Games Today' : 'Connection Error'}
              </div>
              <div style={{ fontSize: 12, color: '#fca5a5' }}>{error.message}</div>
            </div>
          </div>
        )}

        {/* ── LIVE TAB ── */}
        {tab === 'live' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
              {['all', 'live', 'upcoming'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: filter === f ? 700 : 500, cursor: 'pointer',
                  background: filter === f ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${filter === f ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                  color: filter === f ? '#fff' : '#64748b', textTransform: 'uppercase', letterSpacing: .5
                }}>
                  {f}
                </button>
              ))}
              {lastUpdate && <span style={{ fontSize: 11, color: '#334155', marginLeft: 'auto' }}>
                Updated {lastUpdate.toLocaleTimeString()}
              </span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredGames.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>No games match filter.</div>
              )}
              {filteredGames.map((game, idx) => {
                const homeC = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                const awayC = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                const isLive = game.status.type.state === 'in';
                const homeRoster = matchRoster(homeC.team.abbreviation);
                const awayRoster = matchRoster(awayC.team.abbreviation);
                const mom = momentum[game.id];
                const prob = probs[game.id];
                const homeWins = prob !== undefined ? prob : null;
                const parlayHome = parlay.find(p => p.gameId === game.id && p.pick === homeC.team.displayName);
                const parlayAway = parlay.find(p => p.gameId === game.id && p.pick === awayC.team.displayName);
                const awayDepth = getDepthImpact(awayRoster);
                const homeDepth = getDepthImpact(homeRoster);
                return (
                  <div key={game.id} style={{
                    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, overflow: 'hidden', animation: 'slideUp 0.3s ease-out',
                    animationDelay: `${idx * 0.05}s`, boxShadow: '0 2px 12px rgba(0,0,0,0.4)'
                  }}>
                    {/* Status Bar */}
                    {isLive ? (
                      <div style={{
                        background: 'rgba(34,197,94,0.12)', borderBottom: '1px solid rgba(34,197,94,0.2)',
                        padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>LIVE · {game.status.type.detail}</span>
                        </div>
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>
                          Q{game.status.period} · {game.status.displayClock}
                        </span>
                      </div>
                    ) : game.status.type.state === 'pre' ? (
                      <div style={{
                        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        padding: '6px 14px', display: 'flex', justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {new Date(game.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        <span style={{ color: '#334155', fontSize: 11 }}>{game.competitions[0].venue?.fullName}</span>
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        padding: '6px 14px'
                      }}>
                        <span style={{ color: '#475569', fontSize: 11 }}>FINAL</span>
                      </div>
                    )}
                    <div style={{ padding: '12px 16px' }}>
                      {/* Teams */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        {[awayC, homeC].map((team, ti) => (
                          <div key={ti} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={team.team.logo} alt={team.team.abbreviation}
                              style={{ width: 36, height: 36, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {team.team.displayName}
                              </div>
                              <div style={{ fontSize: 10, color: '#475569' }}>{ti === 0 ? 'AWAY' : 'HOME'}</div>
                            </div>
                            <div style={{
                              fontSize: 28, fontWeight: 900, color: isLive ? '#22c55e' : '#f1f5f9',
                              fontFamily: "'Space Grotesk',sans-serif"
                            }}>{team.score}</div>
                          </div>
                        ))}
                      </div>
                      {/* Depth warnings */}
                      {(awayDepth || homeDepth) && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          {awayDepth && <span style={{
                            fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)',
                            borderRadius: 4, padding: '2px 6px'
                          }}>⚠ {awayC.team.abbreviation}: -{awayDepth.ppgLost} PPG ({awayDepth.players.join(', ')} OUT)</span>}
                          {homeDepth && <span style={{
                            fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)',
                            borderRadius: 4, padding: '2px 6px'
                          }}>⚠ {homeC.team.abbreviation}: -{homeDepth.ppgLost} PPG ({homeDepth.players.join(', ')} OUT)</span>}
                        </div>
                      )}
                      {/* Monte Carlo prob bar */}
                      {homeWins !== null && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 3 }}>
                            <span>{awayC.team.abbreviation} {((1 - homeWins) * 100).toFixed(1)}%</span>
                            <span>{homeC.team.abbreviation} {(homeWins * 100).toFixed(1)}%</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${homeWins * 100}%`, borderRadius: 3,
                              background: `linear-gradient(90deg,${awayC.team.color || '#334155'},${homeC.team.color || '#6366f1'})`,
                              transition: 'width 1s ease'
                            }} />
                          </div>
                        </div>
                      )}
                      {/* Momentum Shift */}
                      {mom && (
                        <div style={{
                          marginBottom: 10, padding: '7px 10px', borderRadius: 8,
                          background: mom.shift > 0.05 ? 'rgba(34,197,94,0.1)' : mom.shift < -0.05 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          border: `1px solid ${mom.shift > 0.05 ? 'rgba(34,197,94,0.25)' : mom.shift < -0.05 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: mom.shift > 0.05 ? '#22c55e' : mom.shift < -0.05 ? '#ef4444' : '#f59e0b'
                            }}>
                              {mom.shift > 0.05 ? `⬆ ${homeC.team.abbreviation} MOMENTUM +${(mom.shift * 100).toFixed(1)}%`
                                : mom.shift < -0.05 ? `⬇ ${awayC.team.abbreviation} SWING +${(Math.abs(mom.shift) * 100).toFixed(1)}%`
                                  : '⚡ TOSS-UP · Momentum Neutral'}
                            </span>
                            <span style={{ fontSize: 10, color: '#475569' }}>
                              {mom.diff > 0 ? `+${mom.diff}` : mom.diff} pts · Q{mom.period} {mom.clock}
                            </span>
                          </div>
                          <div style={{ marginTop: 5, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              background: mom.shift > 0 ? '#22c55e' : '#ef4444',
                              width: `${Math.min(Math.abs(mom.shift) * 200, 100)}%`,
                              marginLeft: mom.shift < 0 ? 'auto' : 0,
                              transition: 'width 0.8s ease'
                            }} />
                          </div>
                        </div>
                      )}
                      {/* Odds Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        {[{ comp: awayC, sel: parlayAway }, { comp: homeC, sel: parlayHome }].map(({ comp, sel }, ti) => (
                          <button key={ti} onClick={() => addToParlay(game, comp.team.displayName, ti === 0 ? game.odds.away : game.odds.home)}
                            style={{
                              padding: '10px 12px', borderRadius: 8, border: `2px solid ${sel ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                              background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', cursor: 'pointer',
                              textAlign: 'center', transition: 'all 0.2s'
                            }}>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{comp.team.abbreviation} ML</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: sel ? '#818cf8' : '#f1f5f9' }}>
                              {fmt(ti === 0 ? game.odds.away : game.odds.home)}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '7px 10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 10, color: '#475569' }}>Spread</div>
                          <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 13 }}>{game.odds.spread > 0 ? '+' : ''}{game.odds.spread.toFixed(1)}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '7px 10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 10, color: '#475569' }}>O/U</div>
                          <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 13 }}>{game.odds.overUnder.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROSTERS TAB ── */}
        {tab === 'rosters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {games.length === 0 && <div style={{ color: '#475569', textAlign: 'center', padding: 40 }}>No games loaded.</div>}
            {games.map(game => {
              const homeC = game.competitions[0].competitors.find(c => c.homeAway === 'home');
              const awayC = game.competitions[0].competitors.find(c => c.homeAway === 'away');
              const homeRoster = matchRoster(homeC.team.abbreviation);
              const awayRoster = matchRoster(awayC.team.abbreviation);
              const isLive = game.status.type.state === 'in';
              return (
                <div key={game.id} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{
                    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isLive ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {awayC.team.displayName} @ {homeC.team.displayName}
                    </span>
                    <span style={{ fontSize: 11, color: isLive ? '#22c55e' : '#475569' }}>
                      {isLive ? `🔴 Q${game.status.period} ${game.status.displayClock}` : game.status.type.detail}
                    </span>
                  </div>
                  <div style={{ padding: 14, display: 'flex', gap: 16 }}>
                    <TeamRoster rosterData={awayRoster} teamName={awayC.team.displayName}
                      color={awayRoster?.color} record={awayRoster?.record} />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <TeamRoster rosterData={homeRoster} teamName={homeC.team.displayName}
                      color={homeRoster?.color} record={homeRoster?.record} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PARLAY TAB ── */}
        {tab === 'parlay' && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {simDone && (
                <button onClick={autoPickParlay} style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}>
                  ⚡ Auto Best 4 Legs
                </button>
              )}
              {parlay.length > 0 && (
                <button onClick={clearParlay} style={{
                  padding: '8px 14px', background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontSize: 12, cursor: 'pointer'
                }}>
                  Clear All
                </button>
              )}
            </div>
            {parlay.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <p>Go to Live tab and tap odds buttons to add legs.</p>
                {!simDone && <p style={{ marginTop: 8, fontSize: 13 }}>Run sims first for win probabilities.</p>}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {parlay.map(bet => (
                    <div key={bet.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '10px 14px'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{bet.matchup}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{bet.pick} ML</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{fmt(bet.odds)}</div>
                      <button onClick={() => removeFromParlay(bet.id)} style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12
                      }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))',
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 20
                }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 900, marginBottom: 14 }}>
                    Parlay Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {[['Legs', parlay.length], ['To Win', `$${payoutInfo.profit}`]].map(([l, v]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#818cf8' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Stake $</span>
                    <input type="number" value={parlayStake} min="1" step="10"
                      onChange={e => setParlayStake(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: 70, padding: '6px 10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#f1f5f9', fontSize: 14, fontWeight: 700
                      }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>→ Payout</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>${payoutInfo.payout}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── RANKINGS TAB ── */}
        {tab === 'rankings' && (
          <div>
            {!simDone ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                Run simulations to see game confidence rankings.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 1fr 80px 100px 60px', gap: 8,
                  fontSize: 10, color: '#475569', padding: '0 12px', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4
                }}>
                  <span>#</span><span>Away</span><span>Home</span>
                  <span style={{ textAlign: 'center' }}>Win%</span>
                  <span style={{ textAlign: 'center' }}>Edge</span>
                  <span style={{ textAlign: 'center' }}>Pick</span>
                </div>
                {[...games].filter(g => probs[g.id] !== undefined).sort((a, b) => Math.abs(probs[b.id] - 0.5) - Math.abs(probs[a.id] - 0.5)).map((game, i) => {
                  const homeC = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                  const awayC = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                  const p = probs[game.id];
                  const homeWin = p > 0.5;
                  const winner = homeWin ? homeC : awayC;
                  const winProb = homeWin ? p : 1 - p;
                  const edge = Math.abs(p - 0.5) * 2;
                  const edgeColor = edge > 0.5 ? '#22c55e' : edge > 0.25 ? '#f59e0b' : '#ef4444';
                  const label = edge > 0.5 ? 'HEAVY FAV' : edge > 0.3 ? 'LEAN' : 'TOSS-UP';
                  const mom = momentum[game.id];
                  return (
                    <div key={game.id} style={{
                      display: 'grid', gridTemplateColumns: '28px 1fr 1fr 80px 100px 60px', gap: 8,
                      alignItems: 'center', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: '11px 12px', fontSize: 13
                    }}>
                      <span style={{ fontWeight: 900, color: '#334155', fontSize: 15 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: awayC.team.color || '#94a3b8' }}>{awayC.team.abbreviation}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{awayRosterRecord(awayC)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: homeC.team.color || '#94a3b8' }}>{homeC.team.abbreviation}</div>
                        {mom && <div style={{ fontSize: 9, color: mom.shift > 0.05 ? '#22c55e' : mom.shift < -0.05 ? '#ef4444' : '#f59e0b' }}>
                          {mom.shift > 0.05 ? '⬆ HOME MTM' : mom.shift < -0.05 ? '⬇ AWAY MTM' : '⚡ NEUTRAL'}
                        </div>}
                      </div>
                      <span style={{ textAlign: 'center', fontWeight: 700, color: winner.team.color || edgeColor }}>
                        {(winProb * 100).toFixed(1)}%
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: edgeColor, textAlign: 'center' }}>{label}</div>
                        <div style={{ height: 4, background: '#1e293b', borderRadius: 2 }}>
                          <div style={{ width: `${edge * 100}%`, height: '100%', background: edgeColor, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'center', fontSize: 10, fontWeight: 800, padding: '3px 6px', borderRadius: 5,
                        background: `${winner.team.color || '#6366f1'}33`, border: `1px solid ${winner.team.color || '#6366f1'}55`,
                        color: winner.team.color || '#f1f5f9'
                      }}>
                        {winner.team.abbreviation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function awayRosterRecord(comp) {
  const r = matchRoster(comp.team.abbreviation);
  return r?.record || '';
}

export default NBAOddsApp;
