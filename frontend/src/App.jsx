import React, { useState, useEffect, useMemo } from "react";
import { supabase } from './supabase';


/* ONE & DONE — Fantasy Golf League Manager (prototype)
   Seeded with real 2026 league data from the uploaded spreadsheet:
   60 members, 20 tournaments, picks + FedEx points through The Memorial.
   Browser-only; data persists via window.storage (shared scope). */

const SEED_TOURNAMENTS = [
  { id: "t01", name: "The American Express", course: "PGA West - La Quinta CC", date: "January 22nd - 25th", espnId: "" },
  { id: "t02", name: "Farmers Insurance Open", course: "Torrey Pines GC", date: "January 29th - Feb. 1st", espnId: "" },
  { id: "t03", name: "WM Phoenix Open", course: "TPC Scottsdale - Stadium", date: "February 5th - 8th", espnId: "" },
  { id: "t04", name: "AT&T Pebble Beach Pro-Am", course: "Pebble Beach / Spyglass Hill", date: "February 12th - 15th", espnId: "" },
  { id: "t05", name: "Genesis Invitational", course: "Riviera CC", date: "February 19th - 22nd", espnId: "" },
  { id: "t06", name: "Arnold Palmer Invitational", course: "Bay Hill Club", date: "March 5th - 8th", espnId: "" },
  { id: "t07", name: "The Players Championship", course: "TPC Sawgrass", date: "March 12th - 15th", espnId: "" },
  { id: "t08", name: "Texas Children's Houston Open", course: "Memorial Park GC", date: "March 26th - 29th", espnId: "" },
  { id: "t09", name: "The Masters Tournament", course: "Augusta National Golf Club", date: "April 9th - 12th", espnId: "" },
  { id: "t10", name: "RBC Heritage", course: "Harbour Town Golf Links", date: "April 16th - 19th", espnId: "" },
  { id: "t11", name: "Miami Championship", course: "Trump National Doral", date: "April 30th - May 3rd", espnId: "" },
  { id: "t12", name: "Truist Championship", course: "Quail Hollow Club", date: "May 7th - 10th", espnId: "" },
  { id: "t13", name: "PGA Championship", course: "Aronimink GC", date: "May 14th - 17th", espnId: "" },
  { id: "t14", name: "The Memorial Tournament", course: "Muirfield Village GC", date: "June 4th - 7th", espnId: "" },
  { id: "t15", name: "US Open", course: "Shinnecock Hills GC", date: "June 18th - 21st", espnId: "401811928" },
  { id: "t16", name: "Travelers Championship", course: "TPC River Highlands", date: "June 25th - 28th", espnId: "" },
  { id: "t17", name: "Genesis Scottish Open", course: "The Renaissance Club", date: "July 9th - 12th", espnId: "" },
  { id: "t18", name: "The Open Championship", course: "Royal Birkdale", date: "July 16th - 19th", espnId: "" },
  { id: "t19", name: "3M Open", course: "TPC Twin Cities", date: "Jul 20–26", espnId: "" },
  { id: "t20", name: "Wyndham Championship", course: "Sedgefield CC", date: "August 6th - 9th", espnId: "" },
];

const SEED_MEMBERS = [
  { name: "AJ Brey", email: "aj.brey@league.test", isAdmin: false },
  { name: "Adam Bailey", email: "adam.bailey@league.test", isAdmin: false },
  { name: "Adam Cooney", email: "adam.cooney@league.test", isAdmin: false },
  { name: "Andrew Moffitt", email: "andrew.moffitt@league.test", isAdmin: false },
  { name: "Andrew Yenchick", email: "andrew.yenchick@league.test", isAdmin: false },
  { name: "Andy Ostmark", email: "andy.ostmark@league.test", isAdmin: false },
  { name: "Blake Jensen", email: "blake.jensen@league.test", isAdmin: false },
  { name: "Brian Zullo", email: "brian.zullo@league.test", isAdmin: false },
  { name: "Cameron Danforth", email: "cameron.danforth@league.test", isAdmin: false },
  { name: "Casey Sato", email: "casey.sato@league.test", isAdmin: false },
  { name: "Chris Mendez", email: "chris.mendez@league.test", isAdmin: false },
  { name: "Christian West", email: "christian.west@league.test", isAdmin: false },
  { name: "Cliff Snyder", email: "cliff.snyder@league.test", isAdmin: false },
  { name: "Cody Roseborough", email: "cody.roseborough@league.test", isAdmin: false },
  { name: "Cooper Hanson", email: "cooper.hanson@league.test", isAdmin: false },
  { name: "Cory Ostmark", email: "cory.ostmark@league.test", isAdmin: false },
  { name: "Dakota Bailey", email: "dakota.bailey@league.test", isAdmin: false },
  { name: "Damian Peterson", email: "damian.peterson@league.test", isAdmin: false },
  { name: "Danny Payne", email: "danny.payne@league.test", isAdmin: false },
  { name: "Darin Oberg", email: "darin.oberg@league.test", isAdmin: false },
  { name: "Dylan Cooley", email: "dylan.cooley@league.test", isAdmin: false },
  { name: "Graham Anderson", email: "graham.anderson@league.test", isAdmin: false },
  { name: "Gregg Roseborough", email: "gregg.roseborough@league.test", isAdmin: false },
  { name: "Griffin Jensen", email: "griffin.jensen@league.test", isAdmin: false },
  { name: "Hayden Griffiths", email: "hayden.griffiths@league.test", isAdmin: false },
  { name: "Jack Furbush", email: "jack.furbush@league.test", isAdmin: false },
  { name: "Jake Woodward", email: "jake.woodward@league.test", isAdmin: false },
  { name: "Jared Burton", email: "jared.burton@league.test", isAdmin: false },
  { name: "Jared Peterson", email: "jared.peterson@league.test", isAdmin: false },
  { name: "Jason Glad", email: "jason.glad@league.test", isAdmin: false },
  { name: "Jayden Eakett", email: "jayden.eakett@league.test", isAdmin: false },
  { name: "Jed Smith", email: "jed.smith@league.test", isAdmin: false },
  { name: "Jeff Lots", email: "jeff.lots@league.test", isAdmin: false },
  { name: "Jonah Robles", email: "jonah.robles@league.test", isAdmin: false },
  { name: "Kevan Hodson", email: "kevan.hodson@league.test", isAdmin: false },
  { name: "Kurt Brey", email: "kurt.brey@league.test", isAdmin: false },
  { name: "Matt Campbell", email: "matt.campbell@league.test", isAdmin: false },
  { name: "Matt Irvin", email: "matt.irvin@league.test", isAdmin: false },
  { name: "Matt Jensen", email: "matt.jensen@league.test", isAdmin: false },
  { name: "Michael Hodson", email: "michael.hodson@league.test", isAdmin: false },
  { name: "Mike Sato", email: "mike.sato@league.test", isAdmin: true },
  { name: "Miles Jensen", email: "miles.jensen@league.test", isAdmin: false },
  { name: "Mitch Dunn", email: "mitch.dunn@league.test", isAdmin: false },
  { name: "Natalie Sato", email: "natalie.sato@league.test", isAdmin: false },
  { name: "Nate Sato", email: "nate.sato@league.test", isAdmin: true },
  { name: "Otto Carter", email: "otto.carter@league.test", isAdmin: false },
  { name: "Reggie Jones", email: "reggie.jones@league.test", isAdmin: false },
  { name: "Riley Pack", email: "riley.pack@league.test", isAdmin: false },
  { name: "Ryan Judd", email: "ryan.judd@league.test", isAdmin: false },
  { name: "Samuel Spainhower", email: "samuel.spainhower@league.test", isAdmin: false },
  { name: "Stacy Harbertson", email: "stacy.harbertson@league.test", isAdmin: false },
  { name: "Stephen Rodgers", email: "stephen.rodgers@league.test", isAdmin: false },
  { name: "Steve Harbertson", email: "steve.harbertson@league.test", isAdmin: false },
  { name: "Trent Hymas", email: "trent.hymas@league.test", isAdmin: false },
  { name: "Trevor Erickson", email: "trevor.erickson@league.test", isAdmin: false },
  { name: "Trevor Uptain", email: "trevor.uptain@league.test", isAdmin: false },
  { name: "Tyler Cichos", email: "tyler.cichos@league.test", isAdmin: false },
  { name: "Tyler Hanson", email: "tyler.hanson@league.test", isAdmin: false },
  { name: "Whitney Roseborough", email: "whitney.roseborough@league.test", isAdmin: false },
  { name: "Zach Jones", email: "zach.jones@league.test", isAdmin: false },
];

const CANONICAL_GOLFERS = ["Aaron Rai", "Adam Scott", "Akshay Bhatia", "Ben Griffin", "Billy Horschel", "Brian Harman", "Brooks Koepka", "Bryson DeChambeau", "Cam Davis", "Cameron Young", "Chris Gotterup", "Collin Morikawa", "Corey Conners", "Daniel Berger", "Davis Riley", "Denny McCarthy", "Gary Woodland", "Harris English", "Harry Hall", "Hideki Matsuyama", "JJ Spaun", "JT Poston", "Jake Knapp", "Jason Day", "Jon Rahm", "Jordan Spieth", "Justin Rose", "Justin Thomas", "Keegan Bradley", "Kevin Roy", "Kurt Kitayama", "Lee Hodges", "Ludvig Åberg", "Matt Fitzpatrick", "Maverick McNealy", "Max Homa", "Michael Thorbjørnsen", "Min Woo Lee", "Nick Taylor", "Nicolai Højgaard", "Patrick Cantlay", "Patrick Reed", "Patrick Rodgers", "Pierceson Coody", "Rickie Fowler", "Robert MacIntyre", "Rory McIlroy", "Russell Henley", "Ryan Gerard", "Ryo Hisatsune", "Sahith Theegala", "Sam Burns", "Sam Stevens", "Scottie Scheffler", "Sepp Straka", "Shane Lowry", "Si Woo Kim", "Sungjae Im", "Séamus Power", "Taylor Pendrith", "Tom Kim", "Tommy Fleetwood", "Tony Finau", "Tyrrell Hatton", "Viktor Hovland", "Webb Simpson", "Will Zalatoris", "Wyndham Clark", "Xander Schauffele"];
const HISTORICAL_GOLFERS = ["Aberg", "Adam Scott", "Aksay Bhatia", "Akshay Bhatia", "Akshay “the dark knight” Bhatia (Batman)", "Alex Noren", "Ben Griff", "Ben Griffin", "Ben griffin", "Bhatia", "Big dick Rick fowler", "Big tone", "Brian Harman", "Brooks Koepka", "Brooks koepka", "Bryson", "Bryson DeChambeau", "Bryson Dechambeau", "Bryson dechambeau", "Cam Young", "Cam young", "Cameron David young", "Cameron Young", "Cameron young", "Camron Young", "Can Young", "Cantlay", "Chris Goterrup", "Chris Gotterup", "Christopher Gotterup", "Colin Morikawa", "Collin Morikawa", "Corey Connors", "Denny McCarthy", "Fitzpatrick", "Fleetwood", "Fowler", "Gary Woodland", "Gary woodland", "Gotterup", "Harris English", "Harry Hall", "Hidecki Matsuyama", "Hideki Matsuyama", "Hideki matsuyama", "Hovland", "J.J. Spaun", "J.T. Poston", "JJ Spaun", "JT Poston", "Jake Knapp", "Jake knapp", "Jason Day", "Jason Lad Day", "Jason day", "John Rahm", "Jon Rahm", "Jordan Speith", "Jordan Spieth", "Jordan speith", "Justin Rose", "Justin Thomas", "Keegan Bradley", "Kurt Kitayama", "Lee Hodges", "Ludvig Aberg", "Ludvig Ahberg", "Ludvig aberg", "Ludvig Åberg", "Ludwig Aberg", "Ludwig oberg", "M Fitz", "M. Hughes", "Marco Penge", "Mathew Fitzpatrick", "Matsuyama", "Matt Fitz", "Matt Fitzpatrick", "Matthew Fitzpatrick", "Mav McNealy", "Mav mcnealy", "Maverick", "Maverick McNeally", "Maverick McNealy", "Maverick Mcnealy", "Maverik McNealy", "Max Homa", "Mcilroy", "Michael Thorbjornsen", "Min Woo Lee", "Min Yoo Lee", "Min woo lee", "Morikawa", "Mr sheffler", "N. Hojgaard", "Nicolai Hojgaard", "Patrick Cantlay", "Patrick Cantley", "Patrick Reed", "Patrick cantlay", "Pierceson Coody", "Pierson Coody", "R. Hisatsune", "Rahm", "Rahmbo", "Rickie Fowler", "Ricky Fowler", "Robert MacIntyre", "Robert McIntyre", "Rory", "Rory Daniel Mcilroy", "Rory McIlroy", "Rory Mcilroy", "Rory Mcllroy", "Rory Rory", "Rory mciroy", "Russ henley", "Russel Henley", "Russell Henley", "Russell henley", "Ryan Gerard", "Ryo Hisatsune", "S W Kim", "SW Kim", "Sahith Theegala", "Sahith theegala", "Sam Burns", "Sam Stevens", "Sam burns", "Samuel H Burns", "Sanity Theegala", "Scottie Scheff", "Scottie Scheffeler", "Scottie Scheffler", "Scottie Sheffler", "Scottie scheffler", "Scottie sheffler", "Scotty Scheffler", "Seamus", "Sepp Straka", "Shane Lowry", "Si Woo Kim", "Si woo Kim", "Si woo kim", "Sungjae Im", "Taylor Pendrith", "Theegala", "Thomas P. Fleetwood", "Timmy Fleetwood", "Tommy Fleetwood", "Tommy fleetwood", "Tony Finau", "Tony finau", "Tyrell Hatton", "V. Hovland", "Victor Hovland", "Viktor Hovland", "Will Zalatoris", "Wyndam Clark", "Wyndham Clark", "Xander", "Xander S", "Xander Schauff", "Xander Schauffele", "Xander Schauffle", "Xander Schufffele", "Xander Shauffele", "Xander Shauflee", "Xander schaufele", "Xander shuffle", "hideki matsuyama", "russel henley"];

const SEED_PICKS = {
  "aj.brey@league.test":{t01:{golfer:"JT Poston",points:16},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Russell Henley",points:0},t06:{golfer:"Jake Knapp",points:0},t07:{golfer:"Xander Schauffele",points:350},t08:{golfer:"Rickie Fowler",points:0},t09:{golfer:"Bryson DeChambeau",points:0},t10:{golfer:"Patrick Cantlay",points:164},t11:{golfer:"Chris Gotterup",points:18},t12:{golfer:"Ludvig Aberg",points:188},t13:{golfer:"Matt Fitzpatrick",points:90},t14:{golfer:"Justin Thomas",points:55}},
  "adam.bailey@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Maverick McNealy",points:75},t03:{golfer:"Hideki Matsuyama",points:300},t04:{golfer:"Jake Knapp",points:148},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Si Woo Kim",points:13},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Cameron Young",points:700},t12:{golfer:"Xander Shauffele",points:8},t13:{golfer:"Ludvig Aberg",points:300},t14:{golfer:"Tommy fleetwood",points:313}},
  "adam.cooney@league.test":{t01:{golfer:"Matt Fitzpatrick",points:4},t02:{golfer:"Xander shuffle",points:0},t03:{golfer:"Scottie sheffler",points:125},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"R. Hisatsune",points:16},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Hideki matsuyama",points:39},t08:{golfer:"Min woo lee",points:163},t09:{golfer:"Bryson Dechambeau",points:0},t10:{golfer:"Sam burns",points:58},t11:{golfer:"Viktor Hovland",points:18},t12:{golfer:"Gotterup",points:90},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Ludvig Aberg",points:21}},
  "andrew.moffitt@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Ryan Gerard",points:59},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Scottie Scheffler",points:313},t05:{golfer:"Sahith Theegala",points:0},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Sam Burns",points:37},t09:{golfer:"Justin Rose",points:313},t10:{golfer:"Cameron Young",points:35},t11:{golfer:"Russel Henley",points:13},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"Mathew Fitzpatrick",points:90},t14:{golfer:"Xander",points:33}},
  "andrew.yenchick@league.test":{t01:{golfer:"Russel Henley",points:75},t02:{golfer:"Alex Noren",points:0},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Colin Morikawa",points:700},t05:{golfer:"Matt Fitzpatrick",points:41},t06:{golfer:"Rory McIlroy",points:0},t07:{golfer:"Ludwig Aberg",points:275},t08:{golfer:"Michael Thorbjornsen",points:53},t09:{golfer:"Justin Rose",points:313},t10:{golfer:"Xander Schauffele",points:105},t11:{golfer:"Akshay Bhatia",points:40},t12:{golfer:"Sepp Straka",points:7},t13:{golfer:"Tommy fleetwood",points:0},t14:{golfer:"Si Woo Kim",points:140}},
  "andy.ostmark@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Hideki Matsuyama",points:59},t03:{golfer:"Sepp Straka",points:44},t04:{golfer:"S W Kim",points:16},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Tommy Fleetwood",points:12},t11:{golfer:"Russell Henley",points:13},t12:{golfer:"Cameron Young",points:133},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Matt Fitzpatrick",points:23}},
  "blake.jensen@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Chris Gotterup",points:46},t03:{golfer:"Ben Griffin",points:27},t04:{golfer:"Si woo Kim",points:16},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Aksay Bhatia",points:81},t08:{golfer:"Nicolai Hojgaard",points:300},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Collin Morikawa",points:8},t12:{golfer:"Ludvig Aberg",points:188},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Justin Thomas",points:55}},
  "brian.zullo@league.test":{t01:{golfer:"Cantlay",points:55},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Si woo Kim",points:125},t04:{golfer:"Russell Henley",points:52},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Min Woo Lee",points:26},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Cam Young",points:313},t10:{golfer:"Xander Schauffele",points:105},t11:{golfer:"Hideki Matsuyama",points:11},t12:{golfer:"Ludvig Aberg",points:188},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Ben Griffin",points:0}},
  "cameron.danforth@league.test":{t01:{golfer:"Patrick Cantlay",points:55},t02:{golfer:"Ludvig Åberg",points:0},t03:{golfer:"Maverick McNealy",points:57},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Sepp Straka",points:13},t06:{golfer:"Rory McIlroy",points:0},t07:{golfer:"Rickie Fowler",points:19},t08:{golfer:"Min Woo Lee",points:163},t09:{golfer:"Jordan Spieth",points:102},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Chris Gotterup",points:18},t12:{golfer:"Xander Schauffele",points:8},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Si Woo Kim",points:140}},
  "casey.sato@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Ryan Gerard",points:59},t03:{golfer:"Sanity Theegala",points:44},t04:{golfer:"Russel Henley",points:52},t05:{golfer:"Hideki Matsuyama",points:32},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Min Woo Lee",points:26},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"Jordan Spieth",points:102},t10:{golfer:"Justin Thomas",points:4},t11:{golfer:"Cam Young",points:700},t12:{golfer:"Xander Schauffele",points:8},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Scottie Scheffler",points:100}},
  "chris.mendez@league.test":{t01:{golfer:"Patrick Cantlay",points:55},t02:{golfer:"Max Homa",points:0},t03:{golfer:"Collin Morikawa",points:6},t04:{golfer:"Ludvig Åberg",points:20},t05:{golfer:"Tony Finau",points:32},t06:{golfer:"",points:0},t07:{golfer:"Rory Mcilroy",points:16},t08:{golfer:"Wyndham Clark",points:0},t09:{golfer:"Xander Schauffele",points:188},t10:{golfer:"Matt Fitzpatrick",points:700},t11:{golfer:"Si Woo Kim",points:300},t12:{golfer:"Tommy Fleetwood",points:267},t13:{golfer:"Rahm",points:500},t14:{golfer:"Cam Young",points:15}},
  "christian.west@league.test":{t01:{golfer:"M Fitz",points:4},t02:{golfer:"JJ Spaun",points:0},t03:{golfer:"",points:0},t04:{golfer:"Russel Henley",points:52},t05:{golfer:"Collin Morikawa",points:176},t06:{golfer:"",points:0},t07:{golfer:"",points:0},t08:{golfer:"",points:0},t09:{golfer:"",points:0},t10:{golfer:"",points:0},t11:{golfer:"Cameron Young",points:700},t12:{golfer:"Justin Thomas",points:110},t13:{golfer:"Scottie Sheffler",points:90},t14:{golfer:"Ludvig Aberg",points:21}},
  "cliff.snyder@league.test":{t01:{golfer:"Akshay Bhatia",points:0},t02:{golfer:"Xander Schauff",points:0},t03:{golfer:"Scottie Scheff",points:125},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Harris English",points:47},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Jordan Spieth",points:26},t08:{golfer:"Min Woo Lee",points:163},t09:{golfer:"Morikawa",points:238},t10:{golfer:"Cam Young",points:35},t11:{golfer:"Sam Burns",points:18},t12:{golfer:"Ben Griff",points:7},t13:{golfer:"Aberg",points:300},t14:{golfer:"Maverick",points:140}},
  "cody.roseborough@league.test":{t01:{golfer:"Min Woo Lee",points:16},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Maverick McNealy",points:57},t04:{golfer:"Viktor Hovland",points:9},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Hideki Matsuyama",points:19},t07:{golfer:"Ricky Fowler",points:19},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Ludvig Aberg",points:53},t10:{golfer:"Matt Fitzpatrick",points:700},t11:{golfer:"Gary Woodland",points:18},t12:{golfer:"Kurt Kitayama",points:52},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Ben Griffin",points:0}},
  "cooper.hanson@league.test":{t01:{golfer:"JT Poston",points:16},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Russell Henley",points:52},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Sungjae Im",points:0},t07:{golfer:"Hideki Matsuyama",points:39},t08:{golfer:"Ryan Gerard",points:0},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Jordan Spieth",points:23},t11:{golfer:"Scottie Scheffler",points:400},t12:{golfer:"Rory Mcilroy",points:52},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Ludvig Aberg",points:21}},
  "cory.ostmark@league.test":{t01:{golfer:"Harry Hall",points:36},t02:{golfer:"Theegala",points:85},t03:{golfer:"Mav McNealy",points:57},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Shane Lowry",points:0},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Marco Penge",points:0},t09:{golfer:"Bryson DeChambeau",points:0},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Chris Gotterup",points:18},t12:{golfer:"Rory Mcllroy",points:52},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Can Young",points:15}},
  "dakota.bailey@league.test":{t03:{golfer:"Si Woo Kim",points:125},t04:{golfer:"Jason Day",points:40},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Akshay Bhatia",points:81},t08:{golfer:"Sam Burns",points:37},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Cameron Young",points:35},t11:{golfer:"Collin Morikawa",points:8},t12:{golfer:"Matt Fitzpatrick",points:10},t13:{golfer:"Tyrell Hatton",points:0},t14:{golfer:"JJ Spaun",points:100}},
  "damian.peterson@league.test":{t01:{golfer:"Patrick Cantlay",points:55},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Hideki Matsuyama",points:32},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Jake Knapp",points:0},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Patrick Reed",points:102},t10:{golfer:"Cam Young",points:35},t11:{golfer:"Gary woodland",points:18},t12:{golfer:"Matt Fitzpatrick",points:10},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"",points:0}},
  "danny.payne@league.test":{t01:{golfer:"Tony Finau",points:0},t02:{golfer:"Max Homa",points:0},t03:{golfer:"Maverick McNealy",points:57},t04:{golfer:"",points:0},t05:{golfer:"Jake Knapp",points:275},t06:{golfer:"Rory Mcilroy",points:0},t07:{golfer:"Si Woo Kim",points:13},t08:{golfer:"",points:0},t09:{golfer:"Cameron Young",points:313},t10:{golfer:"",points:0},t11:{golfer:"Sahith Theegala",points:27},t12:{golfer:"",points:0},t13:{golfer:"",points:0},t14:{golfer:"Ludvig Aberg",points:21}},
  "darin.oberg@league.test":{t01:{golfer:"Justin Rose",points:0},t02:{golfer:"Xander Schauffele",points:0},t03:{golfer:"Brooks Koepka",points:0},t04:{golfer:"Russell Henley",points:52},t05:{golfer:"Mcilroy",points:375},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Ricky Fowler",points:19},t08:{golfer:"Nicolai Hojgaard",points:300},t09:{golfer:"John Rahm",points:23},t10:{golfer:"Jordan Spieth",points:23},t11:{golfer:"Scottie Scheffler",points:400},t12:{golfer:"Gary Woodland",points:68},t13:{golfer:"Gotterup",points:145},t14:{golfer:"Cam Young",points:15}},
  "dylan.cooley@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Max Homa",points:0},t03:{golfer:"Si Woo Kim",points:125},t04:{golfer:"Jason Day",points:40},t05:{golfer:"Jake Knapp",points:275},t06:{golfer:"Cameron Young",points:338},t07:{golfer:"Russell Henley",points:81},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"John Rahm",points:23},t10:{golfer:"Maverick McNealy",points:58},t11:{golfer:"Sam Burns",points:18},t12:{golfer:"Tommy Fleetwood",points:267},t13:{golfer:"Jordan Speith",points:56},t14:{golfer:"Scottie Scheffler",points:100}},
  "graham.anderson@league.test":{t01:{golfer:"Patrick Cantlay",points:55},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Maverick McNealy",points:57},t04:{golfer:"Scottie Scheffler",points:313},t05:{golfer:"Russell Henley",points:0},t06:{golfer:"Viktor Hovland",points:90},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Sam Burns",points:58},t11:{golfer:"Cameron Young",points:700},t12:{golfer:"Xander Schauffele",points:8},t13:{golfer:"Tommy Fleetwood",points:0},t14:{golfer:"Ben Griffin",points:0}},
  "gregg.roseborough@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Max Homa",points:0},t03:{golfer:"Chris Gotterup",points:500},t04:{golfer:"Pierson Coody",points:13},t05:{golfer:"Xander Schauffle",points:176},t06:{golfer:"Mathew Fitzpatrick",points:19},t07:{golfer:"Ludvig Ahberg",points:275},t08:{golfer:"Collin Morikawa",points:0},t09:{golfer:"Jake Knapp",points:155},t10:{golfer:"Scotty Scheffler",points:400},t11:{golfer:"Russell Henley",points:13},t12:{golfer:"Sepp Straka",points:7},t13:{golfer:"Camron Young",points:37},t14:{golfer:"Rory McIlroy",points:100}},
  "griffin.jensen@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Hideki Matsuyama",points:59},t03:{golfer:"Ben Griffin",points:27},t04:{golfer:"Jake Knapp",points:148},t05:{golfer:"Matt Fitzpatrick",points:41},t06:{golfer:"Ludvig Åberg",points:338},t07:{golfer:"Chris Gotterup",points:11},t08:{golfer:"Min Woo Lee",points:163},t09:{golfer:"Bryson DeChambeau",points:0},t10:{golfer:"Tommy Fleetwood",points:12},t11:{golfer:"Russell Henley",points:13},t12:{golfer:"Adam Scott",points:38},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Cameron Young",points:15}},
  "hayden.griffiths@league.test":{t01:{golfer:"Matt Fitzpatrick",points:4},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Hidecki Matsuyama",points:300},t04:{golfer:"Tommy fleetwood",points:313},t05:{golfer:"Rory McIlroy",points:375},t06:{golfer:"Xander Schauffle",points:36},t07:{golfer:"Si woo Kim",points:13},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Justin Thomas",points:4},t11:{golfer:"Russell Henley",points:13},t12:{golfer:"Rickie Fowler",points:375},t13:{golfer:"Viktor Hovland",points:0},t14:{golfer:"Ludwig oberg",points:21}},
  "jack.furbush@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Chris Goterrup",points:500},t04:{golfer:"Scotty Scheffler",points:313},t05:{golfer:"Si Woo Kim",points:25},t06:{golfer:"Justin Thomas",points:0},t07:{golfer:"Min woo lee",points:26},t08:{golfer:"Tony Finau",points:15},t09:{golfer:"Patrick Reed",points:102},t10:{golfer:"Timmy Fleetwood",points:12},t11:{golfer:"Victor Hovland",points:18},t12:{golfer:"Rory Mcilroy",points:52},t13:{golfer:"Matt Fitzpatrick",points:90},t14:{golfer:"Sahith Theegala",points:29}},
  "jake.woodward@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Patrick Cantlay",points:0},t03:{golfer:"Scottie Scheffler",points:125},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Rory McIlroy",points:375},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Tony Finau",points:15},t09:{golfer:"Matt Fitzpatrick",points:65},t10:{golfer:"Si Woo Kim",points:350},t11:{golfer:"Cam Young",points:700},t12:{golfer:"Xander",points:8},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Ben Griffin",points:0}},
  "jared.burton@league.test":{t01:{golfer:"Ben griffin",points:36},t02:{golfer:"Jason day",points:16},t03:{golfer:"Si woo Kim",points:125},t04:{golfer:"Jake Knapp",points:148},t05:{golfer:"Big tone",points:32},t06:{golfer:"Rory",points:0},t07:{golfer:"Xander",points:350},t08:{golfer:"Gotterup",points:89},t09:{golfer:"Rahmbo",points:23},t10:{golfer:"Cam young",points:35},t11:{golfer:"Sam burns",points:18},t12:{golfer:"Hovland",points:27},t13:{golfer:"Aberg",points:300},t14:{golfer:"",points:0}},
  "jared.peterson@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"",points:0},t04:{golfer:"Xander Schauffele",points:52},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Min Woo Lee",points:26},t08:{golfer:"Theegala",points:73},t09:{golfer:"Rory McIlroy",points:750},t10:{golfer:"Jake Knapp",points:5},t11:{golfer:"",points:0},t12:{golfer:"Justin Thomas",points:110},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Russel Henley",points:44}},
  "jason.glad@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Xander Schauffele",points:0},t03:{golfer:"Cameron Young",points:12},t04:{golfer:"Viktor Hovland",points:9},t05:{golfer:"Scottie Scheffler",points:105},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Rory Mcllroy",points:16},t08:{golfer:"Min Woo Lee",points:163},t09:{golfer:"Matt Fitzpatrick",points:65},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Matsuyama",points:11},t12:{golfer:"",points:0},t13:{golfer:"",points:0},t14:{golfer:"",points:0}},
  "jayden.eakett@league.test":{t01:{golfer:"Matt Fitzpatrick",points:4},t02:{golfer:"Max Homa",points:0},t03:{golfer:"Cameron Young",points:12},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Min Woo Lee",points:105},t06:{golfer:"",points:0},t07:{golfer:"J.J. Spaun",points:47},t08:{golfer:"",points:0},t09:{golfer:"",points:0},t10:{golfer:"",points:0},t11:{golfer:"",points:0},t12:{golfer:"",points:0},t13:{golfer:"",points:0},t14:{golfer:"",points:0}},
  "jed.smith@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Xander Schauffele",points:0},t03:{golfer:"Hideki Matsuyama",points:300},t04:{golfer:"Rory McIlroy",points:85},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Si Woo Kim",points:13},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Justin Rose",points:6},t12:{golfer:"Cam Young",points:133},t13:{golfer:"Bryson DeChambeau",points:0},t14:{golfer:"Ben Griffin",points:0}},
  "jeff.lots@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Harris English",points:37},t03:{golfer:"Viktor Hovland",points:70},t04:{golfer:"SW Kim",points:16},t05:{golfer:"Patrick Cantlay",points:22},t06:{golfer:"Scottie Scheffler",points:36},t07:{golfer:"Rory Mcilroy",points:16},t08:{golfer:"Michael Thorbjornsen",points:53},t09:{golfer:"Fitzpatrick",points:65},t10:{golfer:"Fleetwood",points:12},t11:{golfer:"Morikawa",points:8},t12:{golfer:"Xander S",points:8},t13:{golfer:"Rahm",points:500},t14:{golfer:"Bhatia",points:0}},
  "jonah.robles@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Sahith theegala",points:85},t03:{golfer:"Jordan speith",points:0},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Hideki Matsuyama",points:32},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Ludvig Åberg",points:275},t08:{golfer:"Min woo lee",points:163},t09:{golfer:"Bryson Dechambeau",points:0},t10:{golfer:"Xander",points:105},t11:{golfer:"Cameron young",points:700},t12:{golfer:"Sepp Straka",points:7},t13:{golfer:"",points:0},t14:{golfer:"Scottie Scheffler",points:100}},
  "kevan.hodson@league.test":{t01:{golfer:"Harry Hall",points:36},t02:{golfer:"Xander Schauffele",points:0},t03:{golfer:"Cameron Young",points:12},t04:{golfer:"Chris Gotterup",points:20},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Shane Lowry",points:0},t07:{golfer:"Keegan Bradley",points:13},t08:{golfer:"Min Yoo Lee",points:163},t09:{golfer:"Matt Fitzpatrick",points:65},t10:{golfer:"Sam Burns",points:58},t11:{golfer:"Min Woo Lee",points:56},t12:{golfer:"Ludvig Aberg",points:188},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Patrick Cantley",points:68}},
  "kurt.brey@league.test":{t01:{golfer:"Taylor Pendrith",points:null},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Corey Connors",points:0},t04:{golfer:"Collin Morikawa",points:700},t05:{golfer:"Ludvig Aberg",points:53},t06:{golfer:"Patrick Cantlay",points:0},t07:{golfer:"Tommy Fleetwood",points:200},t08:{golfer:"Adam Scott",points:37},t09:{golfer:"Cameron Young",points:313},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Sam Burns",points:18},t12:{golfer:"Matt Fitzpatrick",points:10},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Robert McIntyre",points:0}},
  "matt.campbell@league.test":{t02:{golfer:"Jason Day",points:16},t03:{golfer:"Ben Griffin",points:27},t04:{golfer:"Rory McIlroy",points:85},t05:{golfer:"Akshay Bhatia",points:69},t06:{golfer:"Justin Rose",points:0},t07:{golfer:"Sahith Theegala",points:26},t08:{golfer:"Adam Scott",points:37},t09:{golfer:"Xander Shauflee",points:188},t10:{golfer:"Tommy Fleetwood",points:12},t11:{golfer:"Scottie Scheffler",points:400},t12:{golfer:"Matt Fitzpatrick",points:10},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Ludvig Aberg",points:21}},
  "matt.irvin@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Hideki Matsuyama",points:300},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Collin Morikawa",points:176},t06:{golfer:"Rory McIlroy",points:0},t07:{golfer:"Justin Thomas",points:200},t08:{golfer:"Tony Finau",points:15},t09:{golfer:"Matthew Fitzpatrick",points:65},t10:{golfer:"Tommy Fleetwood",points:12},t11:{golfer:"Cameron Young",points:700},t12:{golfer:"Adam Scott",points:38},t13:{golfer:"Xander Schauffele",points:225},t14:{golfer:"Patrick Cantlay",points:68}},
  "matt.jensen@league.test":{t01:{golfer:"Harry Hall",points:36},t02:{golfer:"Chris Gotterup",points:46},t03:{golfer:"Viktor Hovland",points:70},t04:{golfer:"Matt Fitzpatrick",points:85},t05:{golfer:"Ludvig Aberg",points:53},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Xander Schauffele",points:350},t08:{golfer:"Michael Thorbjornsen",points:53},t09:{golfer:"Robert MacIntyre",points:0},t10:{golfer:"Scottie Scheffler",points:400},t11:{golfer:"Sam Burns",points:18},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"Justin Thomas",points:300},t14:{golfer:"Cameron Young",points:15}},
  "michael.hodson@league.test":{t01:{golfer:"Matt Fitzpatrick",points:4},t02:{golfer:"Nicolai Hojgaard",points:37},t03:{golfer:"Brooks Koepka",points:0},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Hideki Matsuyama",points:32},t06:{golfer:"",points:0},t07:{golfer:"Sepp Straka",points:200},t08:{golfer:"M. Hughes",points:0},t09:{golfer:"Bryson Dechambeau",points:0},t10:{golfer:"Cameron Young",points:35},t11:{golfer:"Collin Morikawa",points:8},t12:{golfer:"Adam Scott",points:38},t13:{golfer:"Tommy Fleetwood",points:0},t14:{golfer:"Scottie Scheffeler",points:100}},
  "mike.sato@league.test":{t01:{golfer:"Russell Henley",points:75},t02:{golfer:"Hideki Matsuyama",points:59},t03:{golfer:"Maverik McNealy",points:57},t04:{golfer:"Viktor Hovland",points:9},t05:{golfer:"Sam Burns",points:0},t06:{golfer:"Rory mciroy",points:0},t07:{golfer:"Xander Schauffele",points:350},t08:{golfer:"Tony Finau",points:15},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Patrick Cantlay",points:164},t11:{golfer:"Gary Woodland",points:18},t12:{golfer:"Ben Griffin",points:7},t13:{golfer:"Cameron Young",points:37},t14:{golfer:"Chris Gotterup",points:37}},
  "miles.jensen@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Will Zalatoris",points:0},t03:{golfer:"Pierceson Coody",points:70},t04:{golfer:"Maverick McNealy",points:31},t05:{golfer:"Ryo Hisatsune",points:16},t06:{golfer:"Sepp Straka",points:90},t07:{golfer:"Sahith Theegala",points:26},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"John Rahm",points:23},t10:{golfer:"Jordan Spieth",points:23},t11:{golfer:"Scottie Scheffler",points:400},t12:{golfer:"Ludvig Åberg",points:188},t13:{golfer:"Xander Schauffle",points:225},t14:{golfer:"Rory McIlroy",points:100}},
  "mitch.dunn@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"J.J. Spaun",points:0},t03:{golfer:"Si Woo Kim",points:125},t04:{golfer:"Viktor Hovland",points:9},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"",points:0},t07:{golfer:"Xander schaufele",points:350},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"Bryson Dechambeau",points:0},t10:{golfer:"Matt Fitzpatrick",points:700},t11:{golfer:"",points:0},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Ludvig Åberg",points:21}},
  "natalie.sato@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Sahith Theegala",points:44},t04:{golfer:"Jake Knapp",points:148},t05:{golfer:"Chris Gotterup",points:0},t06:{golfer:"Xander Schauffele",points:36},t07:{golfer:"Scottie Scheffler",points:52},t08:{golfer:"Brooks Koepka",points:0},t09:{golfer:"Justin Rose",points:313},t10:{golfer:"Russel Henley",points:35},t11:{golfer:"Cam young",points:700},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"John Rahm",points:500},t14:{golfer:"Ludvig Aberg",points:21}},
  "nate.sato@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Sam Stevens",points:23},t03:{golfer:"Jordan Spieth",points:0},t04:{golfer:"Jason Day",points:40},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Min Woo Lee",points:26},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Cam Young",points:700},t12:{golfer:"Xander",points:8},t13:{golfer:"Rory McIlroy",points:225},t14:{golfer:"Ben Griffin",points:0}},
  "otto.carter@league.test":{t01:{golfer:"Patrick Cantlay",points:55},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Sepp Straka",points:44},t04:{golfer:"Maverick Mcnealy",points:31},t05:{golfer:"Hideki matsuyama",points:32},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Tommy Fleetwood",points:200},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"Bryson Dechambeau",points:0},t10:{golfer:"Scottie Scheffler",points:400},t11:{golfer:"Cameron Young",points:700},t12:{golfer:"Xander Schauffele",points:8},t13:{golfer:"Jon Rahm",points:500},t14:{golfer:"Si Woo Kim",points:140}},
  "reggie.jones@league.test":{t01:{golfer:"Si woo Kim",points:95},t02:{golfer:"Jason Lad Day",points:16},t03:{golfer:"Mav mcnealy",points:57},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Scottie scheffler",points:105},t06:{golfer:"Colin Morikawa",points:300},t07:{golfer:"Ludvig aberg",points:275},t08:{golfer:"Min woo lee",points:163},t09:{golfer:"Bryson",points:0},t10:{golfer:"Tommy fleetwood",points:12},t11:{golfer:"Russell henley",points:13},t12:{golfer:"Patrick cantlay",points:133},t13:{golfer:"Cam young",points:37},t14:{golfer:"Rory",points:100}},
  "riley.pack@league.test":{t01:{golfer:"Si Woo Kim",points:95},t02:{golfer:"Jason Day",points:16},t03:{golfer:"Sahith theegala",points:44},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Jake Knapp",points:0},t08:{golfer:"Brooks Koepka",points:0},t09:{golfer:"Cameron Young",points:313},t10:{golfer:"Scottie Scheffler",points:400},t11:{golfer:"Akshay Bhatia",points:40},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"Jordan Spieth",points:56},t14:{golfer:"Xander Schauffele",points:33}},
  "ryan.judd@league.test":{t01:{golfer:"Akshay “the dark knight” Bhatia (Batman)",points:0},t02:{golfer:"Nicolai Hojgaard",points:37},t03:{golfer:"",points:0},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Maverick McNeally",points:0},t06:{golfer:"russel henley",points:233},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Michael Thorbjornsen",points:53},t09:{golfer:"Rory Mcilroy",points:750},t10:{golfer:"Tommy Fleetwood",points:12},t11:{golfer:"Adam Scott",points:300},t12:{golfer:"Seamus",points:0},t13:{golfer:"Hovland",points:0},t14:{golfer:"",points:0}},
  "samuel.spainhower@league.test":{t01:{golfer:"Lee Hodges",points:0},t02:{golfer:"Xander Schauffele",points:0},t03:{golfer:"",points:0},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Rory McIlroy",points:375},t06:{golfer:"",points:0},t07:{golfer:"Tommy Fleetwood",points:200},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Bryson DeChambeau",points:0},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Justin Thomas",points:40},t12:{golfer:"Robert MacIntyre",points:8},t13:{golfer:"Justin Rose",points:145},t14:{golfer:"J.J. Spaun",points:100}},
  "stacy.harbertson@league.test":{t01:{golfer:"Sam Burns",points:25},t02:{golfer:"Tony Finau",points:59},t03:{golfer:"Max Homa",points:4},t04:{golfer:"Jordan Spieth",points:31},t05:{golfer:"Collin Morikawa",points:176},t06:{golfer:"Rory McIlroy",points:0},t07:{golfer:"Brian Harman",points:145},t08:{golfer:"Chris Gotterup",points:89},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Patrick Cantlay",points:164},t11:{golfer:"Tommy Fleetwood",points:40},t12:{golfer:"Xander Schauffele",points:8},t13:{golfer:"Cameron Young",points:37},t14:{golfer:"Ludvig Åberg",points:21}},
  "stephen.rodgers@league.test":{t01:{golfer:"Ben Griffin",points:36},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Si Woo Kim",points:125},t04:{golfer:"Mav McNealy",points:31},t05:{golfer:"Hideki Matsuyama",points:32},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Xander Schufffele",points:350},t08:{golfer:"Sam Burns",points:37},t09:{golfer:"Ludvig Aberg",points:53},t10:{golfer:"Patrick Cantlay",points:164},t11:{golfer:"Viktor Hovland",points:18},t12:{golfer:"Matt Fitzpatrick",points:10},t13:{golfer:"Scottie Scheffler",points:90},t14:{golfer:"Justin Thomas",points:55}},
  "steve.harbertson@league.test":{t01:{golfer:"Russell Henley",points:75},t02:{golfer:"Jason day",points:16},t03:{golfer:"Cameron Young",points:12},t04:{golfer:"Hideki Matsuyama",points:148},t05:{golfer:"Xander Schauffele",points:176},t06:{golfer:"Justin Rose",points:0},t07:{golfer:"Scottie Scheffler",points:52},t08:{golfer:"Rickie Fowler",points:0},t09:{golfer:"Ludvig Aberg",points:53},t10:{golfer:"Chris Gotterup",points:35},t11:{golfer:"Jordan Spieth",points:56},t12:{golfer:"Adam Scott",points:38},t13:{golfer:"Rory",points:225},t14:{golfer:"Shane Lowry",points:44}},
  "trent.hymas@league.test":{t01:{golfer:"Ben griffin",points:36},t02:{golfer:"Brooks koepka",points:6},t03:{golfer:"Tony finau",points:0},t04:{golfer:"Akshay Bhatia",points:250},t05:{golfer:"Scottie scheffler",points:105},t06:{golfer:"Thomas P. Fleetwood",points:19},t07:{golfer:"Jake knapp",points:0},t08:{golfer:"Big dick Rick fowler",points:0},t09:{golfer:"Matt Fitzpatrick",points:65},t10:{golfer:"Shane Lowry",points:15},t11:{golfer:"Samuel H Burns",points:18},t12:{golfer:"Rory Daniel Mcilroy",points:52},t13:{golfer:"Cameron David young",points:37},t14:{golfer:"Si woo kim",points:140}},
  "trevor.erickson@league.test":{t01:{golfer:"Robert McIntyre",points:16},t02:{golfer:"JJ Spaun",points:0},t03:{golfer:"",points:0},t04:{golfer:"Russel Henley",points:52},t05:{golfer:"Tony Finau",points:32},t06:{golfer:"Si Woo Kim",points:90},t07:{golfer:"Xander Schauffele",points:350},t08:{golfer:"Jake Knapp",points:89},t09:{golfer:"Rory Rory",points:750},t10:{golfer:"Patrick Cantlay",points:164},t11:{golfer:"Gary Woodland",points:18},t12:{golfer:"Adam Scott",points:38},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Scottie Scheffler",points:100}},
  "trevor.uptain@league.test":{t01:{golfer:"J.T. Poston",points:16},t02:{golfer:"Taylor Pendrith",points:0},t03:{golfer:"Maverick McNealy",points:57},t04:{golfer:"Si Woo Kim",points:16},t05:{golfer:"Tommy Fleetwood",points:176},t06:{golfer:"Matt Fitzpatrick",points:19},t07:{golfer:"Jordan Spieth",points:26},t08:{golfer:"Tony Finau",points:15},t09:{golfer:"Xander Schauffele",points:188},t10:{golfer:"Cameron Young",points:35},t11:{golfer:"Sahith Theegala",points:27},t12:{golfer:"Ludvig Aberg",points:188},t13:{golfer:"",points:0},t14:{golfer:"Fowler",points:0}},
  "tyler.cichos@league.test":{t01:{golfer:"Harry Hall",points:36},t02:{golfer:"Cameron Young",points:37},t03:{golfer:"Hideki Matsuyama",points:300},t04:{golfer:"Justin Rose",points:20},t05:{golfer:"Scottie Scheffler",points:105},t06:{golfer:"Collin Morikawa",points:300},t07:{golfer:"Ludvig Aberg",points:275},t08:{golfer:"Christopher Gotterup",points:89},t09:{golfer:"Jon Rahm",points:23},t10:{golfer:"Xander Schauffele",points:105},t11:{golfer:"Si Woo Kim",points:300},t12:{golfer:"Rory McIlroy",points:52},t13:{golfer:"Bryson DeChambeau",points:0},t14:{golfer:"Rickie Fowler",points:0}},
  "tyler.hanson@league.test":{t01:{golfer:"Sepp Straka",points:0},t02:{golfer:"Wyndam Clark",points:4},t03:{golfer:"Si Woo Kim",points:125},t04:{golfer:"V. Hovland",points:9},t05:{golfer:"Min Woo Lee",points:105},t06:{golfer:"Corey Connors",points:25},t07:{golfer:"Rickie Fowler",points:19},t08:{golfer:"N. Hojgaard",points:300},t09:{golfer:"Scottie Scheffler",points:500},t10:{golfer:"Russell Henley",points:35},t11:{golfer:"Harris English",points:10},t12:{golfer:"Sahith Theegala",points:6},t13:{golfer:"Cameron Young",points:37},t14:{golfer:"Justin Thomas",points:55}},
  "whitney.roseborough@league.test":{t01:{golfer:"Denny McCarthy",points:5},t02:{golfer:"Ludvig Åberg",points:0},t03:{golfer:"hideki matsuyama",points:300},t04:{golfer:"Maverick McNealy",points:31},t05:{golfer:"Rory McIlroy",points:375},t06:{golfer:"Tommy Fleetwood",points:14},t07:{golfer:"Si Woo Kim",points:13},t08:{golfer:"Sahith Theegala",points:73},t09:{golfer:"Xander Schauffele",points:188},t10:{golfer:"Akshay Bhatia",points:58},t11:{golfer:"Collin Morikawa",points:8},t12:{golfer:"Gary Woodland",points:68},t13:{golfer:"Cam Young",points:37},t14:{golfer:"Matt Fitzpatrick",points:23}},
  "zach.jones@league.test":{t01:{golfer:"Kurt Kitayama",points:0},t02:{golfer:"Mav mcnealy",points:75},t03:{golfer:"Theegala",points:4},t04:{golfer:"Hovland",points:9},t05:{golfer:"Mr sheffler",points:105},t06:{golfer:"Fleetwood",points:14},t07:{golfer:"Si woo kim",points:13},t08:{golfer:"Sam Burns",points:37},t09:{golfer:"Bryson dechambeau",points:0},t10:{golfer:"Russ henley",points:35},t11:{golfer:"Min woo lee",points:56},t12:{golfer:"",points:0},t13:{golfer:"Matt Fitz",points:90},t14:{golfer:"Ben griffin",points:0}},
};

const STORAGE_KEY = "oad_league_v3";
const SEED_VERSION = 3;
const CURRENT_SEASON_YEAR = Number(import.meta.env.VITE_SEASON_YEAR || new Date().getFullYear());

const C = {
  fairway: "#1d4d3a", fairwayDk: "#163b2c", flag: "#d94f3d",
  cream: "#f5f2e9", sand: "#e8e0cb", ink: "#16231c",
  line: "#cfc6ad", muted: "#5e6b60", chip: "#eef3ec",
};

// --- Supabase Data Fetching (Replaces Local State) ---

// ---- SUPABASE DATA FETCHING ----------------------------------------------
async function fetchLeagueData() {
  try {
    // 1. Get the current season
    const { data: season, error: sErr } = await supabase
      .from('seasons')
      .select('id')
      .eq('year', CURRENT_SEASON_YEAR)
      .single();
      
    if (sErr) throw sErr;

    // 2. Fetch everything concurrently for speed
    const results = await Promise.all([
      supabase.from('tournaments').select('*').eq('season_id', season.id).order('ordinal'),
      supabase.from('golfers').select('*').order('name'),
      supabase.from('profiles').select('*'),
      supabase.from('picks').select('*, season_entries(profile_id)')
    ]);

    const queryError = results.find(({ error }) => error)?.error;
    if (queryError) throw queryError;

    const [
      { data: dbTournaments },
      { data: dbGolfers },
      { data: dbProfiles },
      { data: dbPicks }
    ] = results;

    // 3. Mold Profiles into the 'users' object
    const users = {};
    dbProfiles.forEach(p => {
      const email = String(p.email || '').trim().toLowerCase();
      if (!email) return;
      users[email] = { name: p.name, email, isAdmin: p.is_admin, id: p.id };
    });

    // 4. Mold Golfers into a flat array
    const golfers = dbGolfers.map(g => g.name).sort();

    // 5. Mold Tournaments into 'startedTournaments' and map UUIDs to local IDs (t01, t02)
    const startedTournaments = {};
    const tourneyIdToLocalId = {}; 
    dbTournaments.forEach(t => {
      const localId = `t${String(t.ordinal).padStart(2, '0')}`;
      tourneyIdToLocalId[t.id] = localId;
      if (t.picks_open || t.scored) startedTournaments[localId] = true;
    });

    // 6. Mold Picks into the nested object
    const picks = {};
    dbProfiles.forEach(p => {
      const email = String(p.email || '').trim().toLowerCase();
      if (email) picks[email] = {};
    });
    
    dbPicks.forEach(p => {
      if (!p.season_entries) return;
      const profile = dbProfiles.find(prof => prof.id === p.season_entries.profile_id);
      if (!profile) return;
      
      const localTid = tourneyIdToLocalId[p.tournament_id];
      if (localTid) {
        const email = String(profile.email || '').trim().toLowerCase();
        if (!picks[email]) picks[email] = {};
        picks[email][localTid] = {
          golfer: p.golfer_name,
          points: p.points
        };
      }
    });

    return { users, picks, golfers, startedTournaments, version: SEED_VERSION };
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return null;
  }
}

// ---- ESPN parsing --------------------------------------------------------
function espnIdFromUrl(url) {
  const m = String(url).match(/tournamentId\/(\d+)/) || String(url).match(/event=(\d+)/);
  return m ? m[1] : "";
}
function cleanName(s) {
  return String(s)
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^(USA|England|Scotland|Canada|Japan|South Korea|Ireland|Australia|Spain|Sweden|Germany|France|China|Norway|Italy|Argentina|Mexico|Belgium|Colombia|Fiji|Philippines|South Africa|Puerto Rico|Denmark|Austria|Netherlands|Chinese Taipei|Thailand|India|Zimbabwe|Venezuela)\s*/i, "")
    .replace(/\(a\)/gi, "").replace(/\*/g, "").replace(/\s+/g, " ").trim();
}
function parseEspnResults(raw) {
  const out = {};
  raw.split(/\r?\n/).forEach((line) => {
    if (line.includes("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length < 4) return;
      const nums = cells.filter((c) => /^\d+$/.test(c.replace(/,/g, "")));
      const pts = nums.length ? parseInt(nums[nums.length - 1].replace(/,/g, ""), 10) : null;
      const nameCell = cells.find((c) => /[A-Za-z]{3,}/.test(c) && !/^POS$|PLAYER|SCORE|EARNINGS|FEDEX|TOT$/i.test(c));
      if (nameCell && pts !== null) { const n = cleanName(nameCell); if (n) out[n] = pts; }
    } else {
      const m = line.match(/^(.*?)[\s.]+([\d,]{1,5})\s*$/);
      if (m) { const n = cleanName(m[1]); if (n) out[n] = parseInt(m[2].replace(/,/g, ""), 10); }
    }
  });
  return out;
}
function norm(x){return String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z ]/g,"").trim();}
function matchPoints(golfer, table) {
  if (!golfer) return null;
  const g = norm(golfer);
  if (table[golfer] !== undefined) return table[golfer];
  for (const k of Object.keys(table)) if (norm(k) === g) return table[k];
  const gp = g.split(" ");
  for (const k of Object.keys(table)) {
    const kp = norm(k).split(" ");
    if (gp.length && kp.length && gp[gp.length-1]===kp[kp.length-1] && gp[0][0]===kp[0][0]) return table[k];
  }
  return null;
}

async function linkProfileToSupabase({ user, email, name }) {
  if (!user?.id || !email) return;
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name || "").trim() || normalizedEmail.split("@")[0];

  try {
    const { error } = await supabase.rpc('link_profile_to_auth_user', {
      p_user_id: user.id,
      p_email: normalizedEmail,
      p_name: normalizedName
    });

    if (error) {
      console.warn('Profile link warning:', error.message);
    }
  } catch (e) {
    console.warn('Profile link warning:', e);
  }
}

function freshState() {
  const users = {};
  SEED_MEMBERS.forEach((member) => {
    users[member.email] = {
      name: member.name,
      email: member.email,
      isAdmin: member.isAdmin
    };
  });

  const picks = {};
  Object.entries(SEED_PICKS).forEach(([email, pickedByTournament]) => {
    const mapped = {};
    Object.entries(pickedByTournament).forEach(([seedTournamentId, pick]) => {
      if (pick && pick.golfer) {
        mapped[seedTournamentId] = { golfer: pick.golfer, points: pick.points ?? null };
      }
    });
    picks[email] = mapped;
  });

  return {
    users,
    picks,
    golfers: [...CANONICAL_GOLFERS].sort(),
    startedTournaments: {}
  };
}

export default function App() {
  const [state, setState] = useState(freshState());
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("pick");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setBooting(true);
      const { data: { session } } = await supabase.auth.getSession();
      let s;

      if (session?.user) {
        const email = session.user.email || "";
        await linkProfileToSupabase({
          user: session.user,
          email,
          name: session.user.user_metadata?.name || email.split('@')[0]
        });
        s = await fetchLeagueData();
        if (active) setMe(email.trim().toLowerCase());
      } else {
        s = await fetchLeagueData();
      }

      if (!s) {
        console.warn("Falling back to local seed data.");
        s = freshState();
      }

      if (active) {
        setState(s || freshState());
        setBooting(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const update = async (next) => {
    setState(next);
  };

  const handleLogin = async (email) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const cloudState = await fetchLeagueData();
    if (cloudState) setState(cloudState);
    setMe(normalizedEmail);
    setTab("pick");
  };

  const handleLogout = () => {
    setMe(null);
    setTab("pick");
    setState(freshState());
  };

  const loginUsers = useMemo(() => {
    const merged = {};
    Object.entries(state.users).forEach(([email, user]) => {
      merged[String(email).trim().toLowerCase()] = { ...user };
    });
    SEED_MEMBERS.forEach((member) => {
      const key = String(member.email).trim().toLowerCase();
      merged[key] = { ...merged[key], ...member, password: "golf" };
    });
    return merged;
  }, [state.users]);

  if (booting) {
    return (
      <Shell>
        <div className="card">
          <div className="eyebrow">Loading clubhouse</div>
          <h2 style={{ fontSize: 24, marginTop: 6, marginBottom: 8 }}>Syncing league data…</h2>
          <p style={{ color: C.muted, margin: 0 }}>The app is loading the current roster and picks.</p>
        </div>
      </Shell>
    );
  }

  if (!me) {
    return (
      <Shell>
        <Login onLogin={handleLogin} users={loginUsers} />
      </Shell>
    );
  }

  const currentUser = state.users[String(me || "").trim().toLowerCase()] || { name: me, email: me, isAdmin: false };

  let content;
  if (tab === "history") {
    content = <HistoryTab state={state} me={me} />;
  } else if (tab === "board") {
    content = <Leaderboard state={state} me={me} />;
  } else if (tab === "league") {
    content = <LeaguePicks me={me} />;
  } else if (tab === "admin" && currentUser.isAdmin) {
    content = <Admin state={state} update={update} />;
  } else {
    content = <PickTab me={me} />;
  }

  return (
    <Shell>
      <Header user={currentUser} tab={tab} setTab={setTab} onLogout={handleLogout} />
      {content}
    </Shell>
  );
}
function Shell({ children }) {
  return (
    <div style={{minHeight:"100vh",background:C.cream,color:C.ink,fontFamily:"'Inter',system-ui,sans-serif",padding:"0 0 64px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bricolage+Grotesque:wght@600;800&display=swap');
        * { box-sizing:border-box; }
        button{font-family:inherit;cursor:pointer;}
        .wrap{max-width:1040px;margin:0 auto;padding:0 20px;}
        .card{background:#fff;border:1px solid ${C.line};border-radius:14px;padding:20px;}
        .btn{background:${C.fairway};color:#fff;border:none;border-radius:9px;padding:10px 16px;font-weight:600;font-size:14px;}
        .btn:hover{background:${C.fairwayDk};}
        .btn.ghost{background:transparent;color:${C.fairway};border:1px solid ${C.fairway};}
        .btn.warn{background:${C.flag};}
        .btn:disabled{background:${C.line};cursor:not-allowed;}
        input,select,textarea{font-family:inherit;font-size:14px;padding:10px 12px;border:1px solid ${C.line};border-radius:9px;background:#fff;width:100%;color:${C.ink};}
        input:focus,select:focus,textarea:focus{outline:2px solid ${C.fairway};outline-offset:1px;}
        table{width:100%;border-collapse:collapse;font-size:14px;}
        th,td{text-align:left;padding:10px 12px;border-bottom:1px solid ${C.line};}
        th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:${C.muted};}
        .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${C.flag};font-weight:700;}
        h1,h2,h3{font-family:'Bricolage Grotesque',sans-serif;margin:0;}
        a{color:${C.fairway};}
/* --- NEW RESPONSIVE GRID CLASS --- */
        .pick-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 20px;
          align-items: start;
        }
        
        @media (max-width: 768px) {
          .pick-grid {
            grid-template-columns: 1fr;
          }
        }
      
      `}</style>
      <div className="wrap" style={{paddingTop:24}}>{children}</div>
    </div>
  );
}

function Header({ user, tab, setTab, onLogout }) {
if (!user) user = { name: "Cloud Player", isAdmin: true };
  const tabs=[["pick","Make a pick"],["history","My picks"],["board","Leaderboard"],["league","League picks"]];
  if (user.isAdmin) tabs.push(["admin","Commissioner"]);
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div><div className="eyebrow">2026 Season · One &amp; Done</div>
          <h1 style={{fontSize:34,lineHeight:1,marginTop:6}}>The Clubhouse</h1></div>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:600}}>{user.name}{user.isAdmin && <span style={{color:C.flag}}> · Commissioner</span>}</div>
          <button className="btn ghost" style={{marginTop:6,padding:"6px 12px"}} onClick={onLogout}>Sign out</button>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:18,flexWrap:"wrap"}}>
        {tabs.map(([k,label])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 16px",borderRadius:9,border:"1px solid "+C.line,fontWeight:600,fontSize:14,background:tab===k?C.fairway:"#fff",color:tab===k?"#fff":C.ink}}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function Login({ onLogin, users = {} }) {
  const [email, setEmail] = useState(""); 
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState("in"); 
  const [name, setName] = useState(""); 
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr(""); 
    setLoading(true);
    const key = email.trim().toLowerCase();

    const seededUser = users[key];
    if (seededUser && pw === seededUser.password) {
      onLogin(key);
      setLoading(false);
      return;
    }
    
    if (mode === "in") {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: key,
          password: pw
        });
        if (error) setErr("Error: " + error.message);
        else {
          await linkProfileToSupabase({
            user: data?.user,
            email: data?.user?.email || key,
            name: data?.user?.user_metadata?.name || key.split('@')[0]
          });
          onLogin(data?.user?.email || key);
        }
      } catch (e) {
        setErr("Local demo login failed. Try a seeded account such as nate.sato@league.test / golf.");
      }
    } else {
      if (!key || !pw || !name.trim()) {
        setErr("Fill in name, email, and password.");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email: key,
          password: pw,
          options: {
            data: { name: name.trim() }
          }
        });
        if (error) setErr("Error: " + error.message);
        else {
          await linkProfileToSupabase({
            user: data?.user,
            email: data?.user?.email || key,
            name: name.trim()
          });
          onLogin(data?.user?.email || key);
        }
      } catch (e) {
        setErr("Account creation is unavailable right now. Try a seeded account instead.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:420,margin:"8vh auto 0",fontFamily:"'Inter', sans-serif"}}>
      <div className="eyebrow" style={{fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:"#d94833",fontWeight:700}}>2026 Season</div>
      <h1 style={{fontSize:40,marginTop:6,marginBottom:4,fontFamily:"'Bricolage Grotesque', sans-serif"}}>One &amp; Done</h1>
      <p style={{color:"#555",marginTop:0}}>Pick one golfer a week. Use them once. Most FedEx Cup points wins.</p>
      <div className="card" style={{background:"#fff",border:"1px solid #ddd",borderRadius:14,padding:20,marginTop:18}}>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          <button onClick={()=>setMode("in")} className={mode==="in"?"btn":"btn ghost"} style={{flex:1,background:mode==="in"?"#1e543a":"transparent",color:mode==="in"?"#fff":"#1e543a",border:mode==="in"?"none":"1px solid #1e543a",borderRadius:9,padding:"10px 16px",fontWeight:600}}>Sign in</button>
          <button onClick={()=>setMode("up")} className={mode==="up"?"btn":"btn ghost"} style={{flex:1,background:mode==="up"?"#1e543a":"transparent",color:mode==="up"?"#fff":"#1e543a",border:mode==="up"?"none":"1px solid #1e543a",borderRadius:9,padding:"10px 16px",fontWeight:600}}>Create account</button>
        </div>
        {mode==="up" && (
          <label style={{display:"block",marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:600}}>Name</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Jane Golfer" style={{marginTop:4,width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #ddd"}}/>
          </label>
        )}
        <label style={{display:"block",marginBottom:12}}>
          <span style={{fontSize:13,fontWeight:600}}>Email</span>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@email.com" style={{marginTop:4,width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #ddd"}}/>
        </label>
        <label style={{display:"block",marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:600}}>Password</span>
          <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&go()} style={{marginTop:4,width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #ddd"}}/>
        </label>
        {err && <p style={{color:"#d94833",fontSize:13,marginTop:0}}>{err}</p>}
        <button style={{width:"100%",background:"#1e543a",color:"#fff",border:"none",borderRadius:9,padding:"10px 16px",fontWeight:600,cursor:loading?"not-allowed":"pointer"}} onClick={go} disabled={loading}>
          {loading ? "Loading..." : (mode==="in" ? "Enter the clubhouse" : "Join the league")}
        </button>
      </div>
    </div>
  );
}
function PickTab({ me }) {
  const [entry, setEntry] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [golfers, setGolfers] = useState([]);
  const [picks, setPicks] = useState({});
  const [tid, setTid] = useState("");
  const [choice, setChoice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPickData = async () => {
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = String(me || "").trim().toLowerCase();
      const [{ data: profile, error: profileError }, { data: season, error: seasonError }] = await Promise.all([
        supabase.from("profiles").select("id").eq("email", normalizedEmail).single(),
        supabase.from("seasons").select("id").eq("year", CURRENT_SEASON_YEAR).single()
      ]);
      if (profileError) throw profileError;
      if (seasonError) throw seasonError;

      const { data: seasonEntry, error: entryError } = await supabase
        .from("season_entries")
        .select("id, status")
        .eq("profile_id", profile.id)
        .eq("season_id", season.id)
        .single();
      if (entryError) throw entryError;
      if (seasonEntry.status !== "active") throw new Error("Your league entry is not active.");

      const [tournamentsResult, golfersResult, picksResult] = await Promise.all([
        supabase
          .from("tournaments")
          .select("id, ordinal, name, course, date_label, scored")
          .eq("season_id", season.id)
          .order("ordinal"),
        supabase.from("golfers").select("name").eq("active", true).order("name"),
        supabase
          .from("picks")
          .select("tournament_id, golfer_name, points")
          .eq("entry_id", seasonEntry.id)
      ]);
      if (tournamentsResult.error) throw tournamentsResult.error;
      if (golfersResult.error) throw golfersResult.error;
      if (picksResult.error) throw picksResult.error;

      const nextPicks = {};
      (picksResult.data || []).forEach((pick) => {
        nextPicks[pick.tournament_id] = {
          golfer: pick.golfer_name,
          points: pick.points
        };
      });

      setEntry(seasonEntry);
      setTournaments(tournamentsResult.data || []);
      setGolfers((golfersResult.data || []).map((golfer) => golfer.name).sort());
      setPicks(nextPicks);
      setTid((currentTid) =>
        (tournamentsResult.data || []).some((tournament) => tournament.id === currentTid)
          ? currentTid
          : tournamentsResult.data?.[0]?.id || ""
      );
    } catch (loadError) {
      console.error("Error loading pick data:", loadError);
      setError(loadError.message || "Unable to load your pick data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickData();
  }, [me]);

  const used = new Set(Object.values(picks).map((pick) => pick.golfer).filter(Boolean));
  const tournament = tournaments.find((item) => item.id === tid);
  const existing = picks[tid];
  const available = golfers.filter((golfer) => !used.has(golfer) || existing?.golfer === golfer);

  const submit = async () => {
    if (!choice || !entry || !tournament || saving) return;
    setSaving(true);
    setError("");

    try {
      const { error: saveError } = await supabase.from("picks").upsert({
        entry_id: entry.id,
        tournament_id: tournament.id,
        golfer_name: choice,
        points: existing?.points ?? null
      }, { onConflict: "entry_id, tournament_id" });
      if (saveError) throw saveError;

      setChoice("");
      await loadPickData();
      alert("✅ 801 One and Done Says Pick successfully saved");
    } catch (saveError) {
      console.error("Error saving pick:", saveError);
      setError(saveError.message || "Unable to save your pick.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><p style={{color:C.muted}}>Loading your pick data...</p></div>;
  if (error) return (
    <div className="card">
      <div className="eyebrow">This week's pick</div>
      <h2 style={{fontSize:24,marginTop:6,marginBottom:10}}>Unable to load picks</h2>
      <p style={{color:C.muted,margin:0}}>{error}</p>
    </div>
  );
  if (!tournament) return <div className="card"><p style={{color:C.muted}}>No tournaments are available for this season.</p></div>;

  return (
    <div className="pick-grid">
      <div className="card">
        <div className="eyebrow">This week's pick</div>
        <label style={{display:"block",margin:"12px 0"}}><span style={{fontSize:13,fontWeight:600}}>Tournament</span>
          <select value={tid} onChange={(e)=>{setTid(e.target.value);setChoice("");}} style={{marginTop:4}}>
            {tournaments.map((item)=>(<option key={item.id} value={item.id}>{item.ordinal}. {item.name}{picks[item.id]?"  ✓ picked":""}</option>))}
          </select></label>
        <p style={{color:C.muted,margin:"0 0 16px",fontSize:13}}>{tournament.course} · {tournament.date_label}</p>
        {existing && (<div style={{background:C.chip,border:"1px solid "+C.line,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
          Current pick: <strong>{existing.golfer||"—"}</strong>
          {existing.points!==null?<span> · {existing.points} pts awarded</span>:<span style={{color:C.muted}}> · not yet scored</span>}
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>You can change this until results post.</div></div>)}
        <label style={{display:"block",marginBottom:14}}><span style={{fontSize:13,fontWeight:600}}>Choose a golfer</span>
          <select value={choice} onChange={(e)=>setChoice(e.target.value)} style={{marginTop:4}} disabled={existing&&existing.points!==null}>
            <option value="">— select —</option>
            {available.map((g)=><option key={g} value={g}>{g}</option>)}
          </select></label>
        <button className="btn" onClick={submit} disabled={!choice||(existing&&existing.points!==null)||saving}>{saving?"Saving...":(existing?"Update pick":"Lock in pick")}</button>
        {existing&&existing.points!==null && <p style={{color:C.muted,fontSize:12,marginTop:10}}>This event is scored and locked. Ask a commissioner to change it.</p>}
      </div>
      <div className="card">
        <div className="eyebrow">Already used ({used.size})</div>
        <p style={{fontSize:13,color:C.muted,marginTop:8}}>Off the board for you the rest of the season.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10,maxHeight:420,overflow:"auto"}}>
          {used.size===0&&<span style={{color:C.muted,fontSize:13}}>None yet.</span>}
          {[...used].sort().map((g)=>(<span key={g} style={{fontSize:12,background:C.sand,borderRadius:20,padding:"4px 11px"}}>{g}</span>))}
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ me }) {
  const [pickRows, setPickRows] = useState([]);
  const [totalPts, setTotalPts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // 1. Identify the user profile and active season
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', me).single();
        const { data: season } = await supabase.from('seasons').select('id').eq('year', CURRENT_SEASON_YEAR).single();
        
        if (profile && season) {
          // 2. Locate their specific season entry
          const { data: entry } = await supabase.from('season_entries').select('id').eq('profile_id', profile.id).eq('season_id', season.id).single();
          
          if (entry) {
            // 3. Fetch their picks and join tournament names/ordinals
            const { data: picks, error } = await supabase
              .from('picks')
              .select(`
                golfer_name,
                points,
                tournaments ( ordinal, name )
              `)
              .eq('entry_id', entry.id);

            if (error) throw error;

            // Sort chronologically by tournament ordinal
            const sortedPicks = picks.sort((a, b) => a.tournaments.ordinal - b.tournaments.ordinal);
            const total = sortedPicks.reduce((sum, p) => sum + (p.points || 0), 0);
            
            setPickRows(sortedPicks);
            setTotalPts(total);
          }
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [me]);

  if (loading) return <div className="card"><p style={{color: C.muted}}>Loading history...</p></div>;

  return (
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:8}}>
        <div><div className="eyebrow">Your season</div><h2 style={{fontSize:24,marginTop:6}}>Pick history</h2></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:32,fontFamily:"'Bricolage Grotesque'",fontWeight:800,color:C.fairway}}>{totalPts}</div>
          <div style={{fontSize:12,color:C.muted}}>total points</div></div>
      </div>
      <table style={{marginTop:16}}>
        <thead><tr><th>#</th><th>Tournament</th><th>Your golfer</th><th style={{textAlign:"right"}}>Points</th></tr></thead>
        <tbody>
          {pickRows.length===0&&<tr><td colSpan={4} style={{color:C.muted}}>No picks yet.</td></tr>}
          {pickRows.map((p, idx)=>{
            return(
            <tr key={idx}><td style={{color:C.muted}}>{p.tournaments.ordinal}</td><td>{p.tournaments.name}</td>
              <td style={{fontWeight:600}}>{p.golfer_name||"—"}</td>
              <td style={{textAlign:"right"}}>{p.points===null?<span style={{color:C.muted}}>pending</span>:<strong>{p.points}</strong>}</td></tr>);})}
        </tbody>
      </table>
    </div>
  );
}

function standings(state){
  const rows=Object.values(state.users).map((u)=>{const mine=state.picks[u.email]||{};
    const total=Object.values(mine).reduce((s,p)=>s+(p.points||0),0);
    return {name:u.name,email:u.email,total,made:Object.keys(mine).length};});
  rows.sort((a,b)=>b.total-a.total);
  const leader=rows.length?rows[0].total:0; let rank=0,prev=null;
  rows.forEach((r,i)=>{if(r.total!==prev){rank=i+1;prev=r.total;}r.rank=rank;r.behind=leader-r.total;});
  return rows;
}
function Leaderboard({ me }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // 1. Identify the active season
        const { data: season } = await supabase.from('seasons').select('id').eq('year', CURRENT_SEASON_YEAR).single();
        if (!season) return;

        // 2. Fetch all entries, joining profile names and pick points
        const { data: entries, error } = await supabase
          .from('season_entries')
          .select(`
            id,
            profiles ( name, email ),
            picks ( points )
          `)
          .eq('season_id', season.id);

        if (error) throw error;

        // 3. Aggregate points and format for display
        const calculatedRows = entries.map(entry => {
          const total = entry.picks.reduce((sum, p) => sum + (p.points || 0), 0);
          return {
            name: entry.profiles.name,
            email: entry.profiles.email,
            total,
            made: entry.picks.length
          };
        });

        // 4. Sort and apply ranks
        calculatedRows.sort((a, b) => b.total - a.total);

        let rank = 0, prev = null, leader = calculatedRows.length ? calculatedRows[0].total : 0;
        calculatedRows.forEach((r, i) => {
          if (r.total !== prev) { rank = i + 1; prev = r.total; }
          r.rank = rank;
          r.behind = leader - r.total;
        });

        setRows(calculatedRows);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="card"><p style={{color: C.muted}}>Loading leaderboard...</p></div>;

  return (
    <div className="card">
      <div className="eyebrow">Standings</div>
      <h2 style={{fontSize:24,marginTop:6,marginBottom:16}}>Contest leaderboard</h2>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: 400 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th style={{textAlign:"right"}}>Points</th>
              <th style={{textAlign:"right"}}>Behind</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r)=>(
              <tr key={r.email} style={r.email===me?{background:C.chip}:(r.rank===1?{background:"#faf6ec"}:undefined)}>
                <td style={{fontWeight:700,color:r.rank===1?C.flag:C.ink}}>{r.rank}{r.rank===1?" 🏆":""}</td>
                <td style={{fontWeight:600,whiteSpace:"nowrap"}}>{r.name}{r.email===me?" (you)":""}</td>
                <td style={{textAlign:"right",fontWeight:700}}>{r.total}</td>
                <td style={{textAlign:"right",color:C.muted}}>{r.behind===0?"—":`-${r.behind}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isStarted(state, tid){
  // A tournament's picks become visible once it has started. A tournament is
  // "started" if a commissioner has opened it, or it already has scored picks.
  if (state.startedTournaments && state.startedTournaments[tid]) return true;
  return Object.values(state.picks).some((mp)=>mp[tid] && mp[tid].points!==null);
}

function LeaguePicks({ me }) {
  const [view, setView] = useState("event");
  const [tid, setTid] = useState("");
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchLeaguePicks = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: season, error: seasonError } = await supabase
          .from("seasons")
          .select("id")
          .eq("year", CURRENT_SEASON_YEAR)
          .single();
        if (seasonError) throw seasonError;

        const [tournamentsResult, entriesResult] = await Promise.all([
          supabase
            .from("tournaments")
            .select("id, ordinal, name, course, date_label, picks_open, scored")
            .eq("season_id", season.id)
            .or("picks_open.eq.true,scored.eq.true")
            .order("ordinal"),
          supabase
            .from("season_entries")
            .select(`
              id,
              profiles ( name, email ),
              picks (
                tournament_id,
                golfer_name,
                points,
                tournaments ( id, ordinal, name, course, date_label, picks_open, scored )
              )
            `)
            .eq("season_id", season.id)
            .eq("status", "active")
        ]);

        if (tournamentsResult.error) throw tournamentsResult.error;
        if (entriesResult.error) throw entriesResult.error;

        const visibleEvents = (tournamentsResult.data || []).filter(
          (tournament) => tournament.picks_open || tournament.scored
        );
        const visibleIds = new Set(visibleEvents.map((tournament) => tournament.id));
        const visibleMembers = (entriesResult.data || [])
          .map((entry) => {
            const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
            const email = String(profile?.email || "").trim().toLowerCase();
            if (!email) return null;

            const picks = {};
            (entry.picks || []).forEach((pick) => {
              if (visibleIds.has(pick.tournament_id)) {
                picks[pick.tournament_id] = {
                  golfer: pick.golfer_name,
                  points: pick.points
                };
              }
            });

            return {
              name: profile.name || email,
              email,
              picks
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (!active) return;
        setEvents(visibleEvents);
        setMembers(visibleMembers);
        setTid((currentTid) =>
          visibleEvents.some((event) => event.id === currentTid)
            ? currentTid
            : visibleEvents[visibleEvents.length - 1]?.id || ""
        );
      } catch (fetchError) {
        console.error("Error fetching league picks:", fetchError);
        if (active) setError(fetchError.message || "Unable to load league picks.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLeaguePicks();
    return () => {
      active = false;
    };
  }, [me]);

  if (loading) return <div className="card"><p style={{color:C.muted}}>Loading league picks...</p></div>;

  if (error) return (
    <div className="card">
      <div className="eyebrow">League picks</div>
      <h2 style={{fontSize:24,marginTop:6,marginBottom:10}}>Unable to load picks</h2>
      <p style={{color:C.muted,margin:0}}>{error}</p>
    </div>
  );

  if (events.length === 0) {
    return (
      <div className="card">
        <div className="eyebrow">League picks</div>
        <h2 style={{fontSize:24,marginTop:6,marginBottom:10}}>Nothing to show yet</h2>
        <p style={{color:C.muted,marginTop:0}}>Everyone's picks stay hidden until a tournament is open or scored. Once an event is opened, picks appear here.</p>
      </div>
    );
  }

  const selectedEvent = events.find((event) => event.id === tid) || events[events.length - 1];
  const counts = {};
  members.forEach((member) => {
    const pick = member.picks[selectedEvent.id];
    if (pick?.golfer) counts[pick.golfer] = (counts[pick.golfer] || 0) + 1;
  });
  const popular = Object.entries(counts).sort((a,b)=>b[1]-a[1]);

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={()=>setView("event")} className={view==="event"?"btn":"btn ghost"}>By tournament</button>
        <button onClick={()=>setView("grid")} className={view==="grid"?"btn":"btn ghost"}>Full history grid</button>
      </div>

      {view==="event" && (
        <div className="card">
          <div className="eyebrow">League picks</div>
          <h2 style={{fontSize:24,marginTop:6,marginBottom:6}}>Who picked whom</h2>
          <p style={{fontSize:13,color:C.muted,marginTop:0}}>Picks unlock once a tournament starts. Only started events are listed.</p>
          <label style={{display:"block",margin:"12px 0"}}><span style={{fontSize:13,fontWeight:600}}>Tournament</span>
            <select value={selectedEvent.id} onChange={(e)=>setTid(e.target.value)} style={{marginTop:4}}>
              {events.map((event)=>(<option key={event.id} value={event.id}>{event.ordinal}. {event.name}</option>))}
            </select></label>

          {popular.length>0 && (
            <div style={{margin:"6px 0 16px"}}>
              <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:6}}>MOST PICKED</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {popular.slice(0,8).map(([g,n])=>(<span key={g} style={{fontSize:12,background:C.chip,border:"1px solid "+C.line,borderRadius:20,padding:"4px 11px"}}>{g} · {n}</span>))}
              </div>
            </div>
          )}

          <table>
            <thead><tr><th>Player</th><th>Pick</th><th style={{textAlign:"right"}}>Points</th></tr></thead>
            <tbody>
              {members.map((member)=>{const pick=member.picks[selectedEvent.id];return(
                <tr key={member.email} style={member.email===me?{background:C.chip}:undefined}>
                  <td style={{fontWeight:600}}>{member.name}{member.email===me?" (you)":""}</td>
                  <td>{pick?.golfer || <span style={{color:C.muted}}>no pick</span>}</td>
                  <td style={{textAlign:"right"}}>{pick && pick.points!==null?<strong>{pick.points}</strong>:<span style={{color:C.muted}}>—</span>}</td>
                </tr>);})}
            </tbody>
          </table>
        </div>
      )}

      {view==="grid" && (
        <div className="card" style={{overflowX:"auto"}}>
          <div className="eyebrow">League picks</div>
          <h2 style={{fontSize:24,marginTop:6,marginBottom:6}}>Full pick history</h2>
          <p style={{fontSize:13,color:C.muted,marginTop:0}}>Columns are tournaments. Events that haven't started are hidden until tee-off.</p>
          <table style={{minWidth:760}}>
            <thead><tr>
              <th style={{position:"sticky",left:0,background:"#fff"}}>Player</th>
              {events.map((event)=>(<th key={event.id} title={event.name}>{event.ordinal}</th>))}
              <th style={{textAlign:"right"}}>Total</th>
            </tr></thead>
            <tbody>
              {members.map((member)=>{
                const total=Object.values(member.picks).reduce((sum,pick)=>sum+(pick.points||0),0);
                return(<tr key={member.email} style={member.email===me?{background:C.chip}:undefined}>
                  <td style={{position:"sticky",left:0,background:member.email===me?C.chip:"#fff",fontWeight:600,whiteSpace:"nowrap"}}>{member.name}{member.email===me?" (you)":""}</td>
                  {events.map((event)=>{const pick=member.picks[event.id];return(
                    <td key={event.id} style={{fontSize:12,whiteSpace:"nowrap"}}>
                      {pick?.golfer?<span>{pick.golfer}{pick.points!==null?<span style={{color:C.muted}}> · {pick.points}</span>:""}</span>:<span style={{color:C.line}}>—</span>}
                    </td>);})}
                  <td style={{textAlign:"right",fontWeight:700}}>{total}</td>
                </tr>);})}
            </tbody>
          </table>
          <p style={{fontSize:12,color:C.muted,marginTop:10}}>Tip: hover a column number to see the tournament name. Showing {events.length} visible events.</p>
        </div>
      )}
    </div>
  );
}
	
function Admin({ state, update }) {
  const [section,setSection]=useState("score");
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[ ["score","Score a tournament"],["open","Open/close picks"],["picks","Edit picks"],["golfers","Golfer pool"],["schedule","League schedule"],["enrollment","Season enrollment"],["season","New Season"],["reset","Reset data"] ].map(([k,l])=>(
          <button key={k} onClick={()=>setSection(k)} className={section===k?"btn":"btn ghost"}>{l}</button>
        ))}
      </div>
      {section==="score"&&<ScoreTool />}
      {section==="open"&&<OpenPicks />}
      {section==="picks"&&<EditPicks />}
      {section==="golfers"&&<GolferPool />}
      {section==="schedule"&&<ScheduleTool />}
      {section==="enrollment"&&<EnrollmentTool />}
      {section==="season"&&<NewSeasonTool />}
      {section==="reset"&&<MigrationTool state={state} />}
    </div>
  );
}

function OpenPicks() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadTournaments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: season, error: seasonError } = await supabase
        .from("seasons").select("id").eq("year", CURRENT_SEASON_YEAR).single();
      if (seasonError) throw seasonError;
      const { data, error: tournamentError } = await supabase
        .from("tournaments")
        .select("id, ordinal, name, picks_open, scored")
        .eq("season_id", season.id)
        .order("ordinal");
      if (tournamentError) throw tournamentError;
      setTournaments(data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load tournaments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTournaments(); }, []);

  const toggle = async (tournament) => {
    if (tournament.scored) return;
    setBusyId(tournament.id);
    setError("");
    try {
      const { data, error: updateError } = await supabase
        .from("tournaments")
        .update({ picks_open: !tournament.picks_open })
        .eq("id", tournament.id)
        .select("id, ordinal, name, picks_open, scored")
        .single();
      if (updateError) throw updateError;
      setTournaments((current) => current.map((item) => item.id === data.id ? data : item));
    } catch (updateError) {
      setError(updateError.message || "Unable to update tournament visibility.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="card"><p style={{color:C.muted}}>Loading tournament visibility...</p></div>;
  return (
    <div className="card">
      <div className="eyebrow">Pick visibility</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:6}}>Open or close a tournament's picks</h2>
      <p style={{fontSize:13,color:C.muted,marginTop:0}}>When a tournament is open, the whole league can see everyone's pick for it on the League picks tab. Keep it closed until tee-off so no one gains an edge. Events with scored results are always open.</p>
      <table>
        <thead><tr><th>Tournament</th><th style={{textAlign:"center"}}>Picks visible?</th><th style={{textAlign:"right"}}>Action</th></tr></thead>
        <tbody>
          {tournaments.map((tournament)=>{
            return(<tr key={tournament.id}>
              <td>{tournament.ordinal}. {tournament.name}</td>
              <td style={{textAlign:"center"}}>{tournament.picks_open||tournament.scored?<span style={{color:C.fairway,fontWeight:600}}>Open</span>:<span style={{color:C.muted}}>Closed</span>}</td>
              <td style={{textAlign:"right"}}>
                {tournament.scored ? <span style={{fontSize:12,color:C.muted}}>locked (scored)</span>
                  : <button className={tournament.picks_open?"btn ghost":"btn"} style={{padding:"6px 12px"}} onClick={()=>toggle(tournament)} disabled={busyId===tournament.id}>{busyId===tournament.id?"Saving...":(tournament.picks_open?"Close picks":"Open picks")}</button>}
              </td></tr>);})}
        </tbody>
      </table>
      {error && <p style={{color:C.flag,fontSize:13,marginBottom:0}}>{error}</p>}
    </div>
  );
}

function ScoreTool() {
  const [tournaments,setTournaments]=useState([]); const [entries,setEntries]=useState([]);
  const [tid,setTid]=useState(""); const [url,setUrl]=useState(""); const [raw,setRaw]=useState("");
  const [preview,setPreview]=useState(null); const [note,setNote]=useState(""); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const {data:season,error:seasonError}=await supabase.from("seasons").select("id").eq("year",CURRENT_SEASON_YEAR).single();
        if(seasonError) throw seasonError;
        const [tournamentResult,entryResult]=await Promise.all([
          supabase.from("tournaments").select("id, ordinal, name, espn_event_id, scored").eq("season_id",season.id).order("ordinal"),
          supabase.from("season_entries").select("id, profiles(name, email), picks(tournament_id, golfer_name, points)").eq("season_id",season.id).eq("status","active")
        ]);
        if(tournamentResult.error) throw tournamentResult.error;
        if(entryResult.error) throw entryResult.error;
        setTournaments(tournamentResult.data||[]); setEntries(entryResult.data||[]); setTid(tournamentResult.data?.[0]?.id||"");
      } catch(error) { setNote(`❌ ${error.message}`); }
      finally { setLoading(false); }
    })();
  },[]);

  const t=tournaments.find((x)=>x.id===tid); const resolvedId=espnIdFromUrl(url)||t?.espn_event_id||"";
  const liveLink=resolvedId?`https://www.espn.com/golf/leaderboard/_/tournamentId/${resolvedId}`:"";
  const build=()=>{
    const table=parseEspnResults(raw); const count=Object.keys(table).length;
    if(!count){setNote("Couldn't read any rows. Paste the leaderboard rows including the FEDEX PTS column.");setPreview(null);return;}
    const results=[];
    entries.forEach((entry)=>{
      const profile=Array.isArray(entry.profiles)?entry.profiles[0]:entry.profiles;
      const pick=(entry.picks||[]).find((item)=>item.tournament_id===tid); if(!pick?.golfer_name)return;
      const pts=matchPoints(pick.golfer_name,table);
      results.push({entryId:entry.id,email:profile?.email,name:profile?.name,golfer:pick.golfer_name,pts,matched:pts!==null});
    });
    setPreview(results); setNote(`Parsed ${count} golfers from ESPN. ${results.filter((r)=>!r.matched).length} pick(s) need a manual number below (highlighted).`);
  };
  const apply=async()=>{if(!preview||!t||preview.some((r)=>r.pts===null))return;setSaving(true);
    try {
      const {error:pickError}=await supabase.from("picks").upsert(preview.map((r)=>({entry_id:r.entryId,tournament_id:tid,golfer_name:r.golfer,points:r.pts})),{onConflict:"entry_id, tournament_id"});
      if(pickError)throw pickError;
      const {error:tournamentError}=await supabase.from("tournaments").update({scored:true,picks_open:true}).eq("id",tid);
      if(tournamentError)throw tournamentError;
      setNote("Scores applied to Supabase. The tournament is now marked scored.");setPreview(null);setRaw("");
    } catch(error){setNote(`❌ ${error.message}`);} finally{setSaving(false);}
  };
  const setManual=(email,val)=>setPreview(preview.map((r)=>r.email===email?{...r,pts:val===""?null:parseInt(val,10),matched:val!==""}:r));
  const pickedCount=entries.reduce((count,entry)=>count+(entry.picks||[]).some((pick)=>pick.tournament_id===tid)?1:0);

  if(loading)return <div className="card"><p style={{color:C.muted}}>Loading scoring data...</p></div>;
  if(!t)return <div className="card"><p style={{color:C.muted}}>No tournaments are available for scoring.</p></div>;

  return (
    <div className="card">
      <div className="eyebrow">Automated scoring</div>
      <h2 style={{fontSize:22,marginTop:6}}>Score: {t.name}</h2>
      <label style={{display:"block",margin:"12px 0"}}><span style={{fontSize:13,fontWeight:600}}>Tournament</span>
        <select value={tid} onChange={(e)=>{setTid(e.target.value);setPreview(null);}} style={{marginTop:4}}>
          {tournaments.map((x)=><option key={x.id} value={x.id}>{x.ordinal}. {x.name}{x.scored?"  ✓ scored":""}</option>)}
        </select></label>
      <p style={{fontSize:13,color:C.muted,marginTop:0}}>{pickedCount} member(s) have a pick for this event.</p>

      <label style={{display:"block",margin:"4px 0 12px"}}><span style={{fontSize:13,fontWeight:600}}>ESPN leaderboard link</span>
        <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://www.espn.com/golf/leaderboard/_/tournamentId/401811928" style={{marginTop:4}}/></label>
      {liveLink
        ? <p style={{fontSize:13,marginTop:0}}>Open results → <a href={liveLink} target="_blank" rel="noreferrer">{liveLink}</a>, select the table, and paste below.</p>
        : <p style={{fontSize:13,color:C.muted,marginTop:0}}>Paste a link above (or pick an event with a known ID) to get a direct results link.</p>}

      <textarea rows={7} value={raw} onChange={(e)=>setRaw(e.target.value)} placeholder="Paste the ESPN leaderboard rows here…" />
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button className="btn" onClick={build}>Preview scores</button>
        {preview && <button className="btn warn" onClick={apply} disabled={saving||preview.some((r)=>r.pts===null)}>{saving?"Saving...":"Apply to leaderboard"}</button>}
      </div>
      {note && <p style={{fontSize:13,color:C.muted,marginTop:12}}>{note}</p>}
      {preview && (
        <table style={{marginTop:14}}>
          <thead><tr><th>Player</th><th>Their golfer</th><th style={{textAlign:"right"}}>Points</th></tr></thead>
          <tbody>
            {preview.map((r)=>(<tr key={r.email} style={!r.matched?{background:"#fcefed"}:undefined}>
              <td>{r.name}</td>
              <td style={{color:r.matched?C.ink:C.flag}}>{r.golfer}{!r.matched&&" (no match — enter pts)"}</td>
              <td style={{textAlign:"right",width:110}}>
                <input value={r.pts===null?"":r.pts} onChange={(e)=>setManual(r.email,e.target.value)} style={{textAlign:"right",padding:"5px 8px"}}/>
              </td></tr>))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EditPicks() {
  const [members,setMembers]=useState([]); const [tournaments,setTournaments]=useState([]); const [golfers,setGolfers]=useState([]);
  const [email,setEmail]=useState(""); const [picks,setPicks]=useState({}); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=async()=>{
    setLoading(true);setError("");
    try {
      const {data:season,error:seasonError}=await supabase.from("seasons").select("id").eq("year",CURRENT_SEASON_YEAR).single();if(seasonError)throw seasonError;
      const [tournamentResult,entryResult,golferResult]=await Promise.all([
        supabase.from("tournaments").select("id, ordinal, name").eq("season_id",season.id).order("ordinal"),
        supabase.from("season_entries").select("id, profiles(name, email), picks(tournament_id, golfer_name, points)").eq("season_id",season.id).eq("status","active"),
        supabase.from("golfers").select("name").eq("active",true).order("name")
      ]);
      if(tournamentResult.error)throw tournamentResult.error;if(entryResult.error)throw entryResult.error;if(golferResult.error)throw golferResult.error;
      const nextMembers=(entryResult.data||[]).map((entry)=>{const profile=Array.isArray(entry.profiles)?entry.profiles[0]:entry.profiles;return {...entry,email:String(profile?.email||"").toLowerCase(),name:profile?.name||profile?.email||""};}).filter((entry)=>entry.email).sort((a,b)=>a.name.localeCompare(b.name));
      setTournaments(tournamentResult.data||[]);setMembers(nextMembers);setGolfers((golferResult.data||[]).map((g)=>g.name));
      setEmail((current)=>nextMembers.some((member)=>member.email===current)?current:nextMembers[0]?.email||"");
    } catch(loadError){setError(loadError.message||"Unable to load member picks.");} finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  const member=members.find((item)=>item.email===email); const mine=member?.picks||[];
  const byTournament={};mine.forEach((pick)=>{byTournament[pick.tournament_id]=pick;});
  const used=new Set(mine.map((pick)=>pick.golfer_name).filter(Boolean));
  const savePick=async(tournamentId,golfer)=>{
    if(!member)return;
    try {
      if(!golfer){const {error:deleteError}=await supabase.from("picks").delete().eq("entry_id",member.id).eq("tournament_id",tournamentId);if(deleteError)throw deleteError;}
      else {const current=byTournament[tournamentId];const {error:saveError}=await supabase.from("picks").upsert({entry_id:member.id,tournament_id:tournamentId,golfer_name:golfer,points:current?.points??null},{onConflict:"entry_id, tournament_id"});if(saveError)throw saveError;}
      await load();
    } catch(saveError){setError(saveError.message||"Unable to save pick override.");}
  };
  const setPts=async(tournamentId,val)=>{if(!member)return;const current=byTournament[tournamentId];if(!current)return;try{const {error:saveError}=await supabase.from("picks").update({points:val===""?null:parseInt(val,10)}).eq("entry_id",member.id).eq("tournament_id",tournamentId);if(saveError)throw saveError;await load();}catch(saveError){setError(saveError.message||"Unable to save points.");}};
  if(loading)return <div className="card"><p style={{color:C.muted}}>Loading member picks...</p></div>;
  if(!member)return <div className="card"><p style={{color:C.muted}}>No active league members found.</p></div>;
  return (
    <div className="card">
      <div className="eyebrow">Manual override</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:12}}>Edit a player's picks</h2>
      <label style={{display:"block",marginBottom:14}}><span style={{fontSize:13,fontWeight:600}}>League member</span>
        <select value={email} onChange={(e)=>setEmail(e.target.value)} style={{marginTop:4}}>
          {members.map((u)=><option key={u.email} value={u.email}>{u.name}</option>)}
        </select></label>
      <table>
        <thead><tr><th>Tournament</th><th>Golfer</th><th style={{textAlign:"right"}}>Points</th></tr></thead>
        <tbody>
          {tournaments.map((t)=>{const p=byTournament[t.id];
            const opts=golfers.filter((g)=>!used.has(g)||(p&&p.golfer_name===g)).sort();
            return(<tr key={t.id}><td style={{fontSize:13}}>{t.name}</td>
              <td><select value={p?p.golfer_name:""} onChange={(e)=>savePick(t.id,e.target.value)} style={{padding:"5px 8px"}}>
                <option value="">— none —</option>{opts.map((g)=><option key={g} value={g}>{g}</option>)}</select></td>
              <td style={{textAlign:"right",width:100}}>
                <input value={p&&p.points!==null?p.points:""} onChange={(e)=>setPts(t.id,e.target.value)} disabled={!p} style={{textAlign:"right",padding:"5px 8px"}}/></td></tr>);})}
        </tbody>
      </table>
      {error && <p style={{color:C.flag,fontSize:13}}>{error}</p>}
    </div>
  );
}

function GolferPool() {
  const [name,setName]=useState("");
  const [golfers,setGolfers]=useState([]); const [error,setError]=useState("");
  useEffect(()=>{supabase.from("golfers").select("espn_id, name, active").order("name").then(({data,error})=>{if(error)setError(error.message);else setGolfers(data||[]);});},[]);
  const add=async()=>{const n=name.trim();if(!n||golfers.some((g)=>g.name===n))return;setError("");const {data,error}=await supabase.from("golfers").insert({name:n,espn_id:`manual-${crypto.randomUUID()}`,active:true}).select("espn_id, name, active").single();if(error)setError(error.message);else{setGolfers((current)=>[...current,data].sort((a,b)=>a.name.localeCompare(b.name)));setName("");}};
  const remove=async(g)=>{const {error}=await supabase.from("golfers").update({active:false}).eq("espn_id",g.espn_id);if(error)setError(error.message);else setGolfers((current)=>current.filter((item)=>item.espn_id!==g.espn_id));};
  return (
    <div className="card">
      <div className="eyebrow">Field management</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:12}}>Golfer pool ({golfers.length})</h2>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Add a golfer…" onKeyDown={(e)=>e.key==="Enter"&&add()}/>
        <button className="btn" onClick={add}>Add</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:460,overflow:"auto"}}>
        {golfers.map((g)=>(<span key={g.espn_id} style={{fontSize:13,background:C.sand,borderRadius:20,padding:"5px 10px 5px 12px",display:"inline-flex",alignItems:"center",gap:6}}>
          {g.name}<button onClick={()=>remove(g)} style={{border:"none",background:"none",color:C.flag,fontWeight:700,fontSize:15,lineHeight:1,padding:0}}>×</button></span>))}
      </div>
      {error && <p style={{color:C.flag,fontSize:13}}>{error}</p>}
    </div>
  );
}

function ResetTool({ update }) {
  const [done,setDone]=useState(false);
  const reset=async()=>{await update(freshState());setDone(true);};
  return (
    <div className="card">
      <div className="eyebrow">Danger zone</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:10}}>Reset to sheet data</h2>
      <p style={{fontSize:14,color:C.muted,marginTop:0}}>Wipes all changes made in the app and reloads the original picks and scores from the uploaded spreadsheet (through The Memorial). New accounts you created will be removed. Use this to get back to a clean test state.</p>
      <button className="btn warn" onClick={reset}>Reset all league data</button>
      {done && <p style={{color:C.fairway,fontSize:13,marginTop:10}}>Done. Data restored to the spreadsheet baseline.</p>}
    </div>
  );
}
function ScheduleTool() {
  const [tournaments,setTournaments]=useState([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{
    (async()=>{
      try {
        const {data:season,error:seasonError}=await supabase.from("seasons").select("id").eq("year",CURRENT_SEASON_YEAR).single();if(seasonError)throw seasonError;
        const {data,error:queryError}=await supabase.from("tournaments").select("id, ordinal, name, course, date_label, espn_event_id").eq("season_id",season.id).order("ordinal");if(queryError)throw queryError;setTournaments(data||[]);
      } catch(queryError){setError(queryError.message||"Unable to load the schedule.");}finally{setLoading(false);}
    })();
  },[]);
  const change=(id,field,value)=>setTournaments((current)=>current.map((item)=>item.id===id?{...item,[field]:value}:item));
  const save=async(tournament)=>{setSaving(tournament.id);setError("");try{const {data,error:saveError}=await supabase.from("tournaments").update({name:tournament.name,course:tournament.course,date_label:tournament.date_label,espn_event_id:tournament.espn_event_id||null}).eq("id",tournament.id).select("id, ordinal, name, course, date_label, espn_event_id").single();if(saveError)throw saveError;setTournaments((current)=>current.map((item)=>item.id===data.id?data:item));}catch(saveError){setError(saveError.message||"Unable to save the schedule.");}finally{setSaving(null);}};
  if(loading)return <div className="card"><p style={{color:C.muted}}>Loading league schedule...</p></div>;
  return <div className="card"><div className="eyebrow">Schedule management</div><h2 style={{fontSize:22,marginTop:6,marginBottom:12}}>Edit the 2026 schedule</h2>
    {tournaments.map((tournament)=><div key={tournament.id} style={{borderTop:"1px solid "+C.line,padding:"12px 0",display:"grid",gridTemplateColumns:"42px 1.4fr 1fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
      <strong>{tournament.ordinal}</strong>
      {[['name','Name'],['course','Course'],['date_label','Date'],['espn_event_id','ESPN ID']].map(([field,label])=><label key={field}><span style={{fontSize:11,fontWeight:600}}>{label}</span><input value={tournament[field]||""} onChange={(e)=>change(tournament.id,field,e.target.value)} style={{marginTop:3,padding:"7px 8px"}}/></label>)}
      <button className="btn" onClick={()=>save(tournament)} disabled={saving===tournament.id}>{saving===tournament.id?"Saving...":"Save"}</button>
    </div>)}
    {error&&<p style={{color:C.flag,fontSize:13}}>{error}</p>}
  </div>;
}

function EnrollmentTool() {
  const [seasons,setSeasons]=useState([]); const [selectedId,setSelectedId]=useState("");
  const [profileCount,setProfileCount]=useState(0); const [entryCount,setEntryCount]=useState(0);
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [note,setNote]=useState("");

  const load=async()=>{
    setLoading(true);setError("");
    try {
      const [seasonResult,profileResult]=await Promise.all([
        supabase.from("seasons").select("id, year, name, status").order("year",{ascending:false}),
        supabase.from("profiles").select("id")
      ]);
      if(seasonResult.error)throw seasonResult.error;if(profileResult.error)throw profileResult.error;
      setSeasons(seasonResult.data||[]);setProfileCount((profileResult.data||[]).length);
      setSelectedId((current)=>(seasonResult.data||[]).some((season)=>season.id===current)?current:seasonResult.data?.[0]?.id||"");
    } catch(loadError){setError(loadError.message||"Unable to load seasons.");} finally{setLoading(false);}
  };
  const loadEntries=async(seasonId)=>{if(!seasonId)return;const {count,error:entryError}=await supabase.from("season_entries").select("id",{count:"exact",head:true}).eq("season_id",seasonId).eq("status","active");if(entryError)setError(entryError.message);else setEntryCount(count||0);};
  useEffect(()=>{load();},[]); useEffect(()=>{loadEntries(selectedId);},[selectedId]);
  const selected=seasons.find((season)=>season.id===selectedId);
  const updateStatus=async(status)=>{if(!selected)return;setBusy(true);setError("");setNote("");try{const {data,error:updateError}=await supabase.from("seasons").update({status}).eq("id",selected.id).select("id, year, name, status").single();if(updateError)throw updateError;setSeasons((current)=>current.map((season)=>season.id===data.id?data:season));setNote(status==="active"?"Enrollment is open for this season.":"Season returned to setup mode.");}catch(updateError){setError(updateError.message||"Unable to update enrollment status.");}finally{setBusy(false);}};
  const enrollAll=async()=>{if(!selected)return;setBusy(true);setError("");setNote("");try{const {data:profiles,error:profileError}=await supabase.from("profiles").select("id");if(profileError)throw profileError;const {data:existing,error:entryError}=await supabase.from("season_entries").select("profile_id").eq("season_id",selected.id);if(entryError)throw entryError;const present=new Set((existing||[]).map((entry)=>entry.profile_id));const missing=(profiles||[]).filter((profile)=>!present.has(profile.id)).map((profile)=>({season_id:selected.id,profile_id:profile.id,status:"active"}));if(missing.length){const {error:insertError}=await supabase.from("season_entries").insert(missing);if(insertError)throw insertError;}await loadEntries(selected.id);setNote(`✅ ${missing.length || "All"} profiles enrolled in ${selected.name}.`);}catch(enrollError){setError(enrollError.message||"Unable to enroll profiles.");}finally{setBusy(false);}};
  if(loading)return <div className="card"><p style={{color:C.muted}}>Loading season enrollment...</p></div>;
  if(!selected)return <div className="card"><p style={{color:C.muted}}>Create a season before configuring enrollment.</p></div>;
  return <div className="card"><div className="eyebrow">Season enrollment</div><h2 style={{fontSize:22,marginTop:6,marginBottom:10}}>Prepare the next season</h2>
    <label style={{display:"block",marginBottom:14}}><span style={{fontSize:13,fontWeight:600}}>Season</span><select value={selectedId} onChange={(e)=>setSelectedId(e.target.value)} style={{marginTop:4}}>{seasons.map((season)=><option key={season.id} value={season.id}>{season.year} · {season.name} · {season.status}</option>)}</select></label>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,marginBottom:16}}><div style={{background:C.chip,padding:12,borderRadius:10}}><strong>{entryCount}</strong><div style={{fontSize:12,color:C.muted}}>active entries</div></div><div style={{background:C.chip,padding:12,borderRadius:10}}><strong>{profileCount}</strong><div style={{fontSize:12,color:C.muted}}>profiles available</div></div></div>
    <p style={{fontSize:13,color:C.muted,marginTop:0}}>Draft keeps the season in setup mode. Active opens it for play. Enrolling all profiles is idempotent and does not alter prior-season entries or picks.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn" onClick={enrollAll} disabled={busy}>Enroll all existing profiles</button><button className="btn ghost" onClick={()=>updateStatus("active")} disabled={busy||selected.status==="active"}>Open enrollment</button><button className="btn ghost" onClick={()=>updateStatus("draft")} disabled={busy||selected.status==="draft"}>Keep in setup</button></div>
    {note&&<p style={{color:C.fairway,fontSize:13}}>{note}</p>}{error&&<p style={{color:C.flag,fontSize:13}}>{error}</p>}
  </div>;
}

function NewSeasonTool() {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [name, setName] = useState(`${new Date().getFullYear() + 1} Season`);
  const [status, setStatus] = useState("");

  const handleYearChange = (e) => {
    const val = e.target.value;
    setYear(val);
    setName(`${val} Season`);
    setStatus("");
  };

  const createSeason = async () => {
    setStatus("");
    try {
      const { data, error } = await supabase
        .from("seasons")
        .insert({ year: Number(year), name: name.trim(), status: "draft" })
        .select("id, year, name, status")
        .single();
      if (error) throw error;
      const { error: scheduleError } = await supabase.from("tournaments").insert(
        SEED_TOURNAMENTS.map((tournament, index) => ({
          season_id: data.id,
          ordinal: index + 1,
          name: tournament.name,
          course: tournament.course,
          date_label: tournament.date,
          espn_event_id: tournament.espnId || null
        }))
      );
      if (scheduleError) throw scheduleError;
      setStatus(`✅ Successfully initialized the ${data.name} (${data.status}) with ${SEED_TOURNAMENTS.length} schedule rows.`);
    } catch (error) {
      setStatus(`❌ ${error.message}`);
    }
  };

  return (
    <div className="card">
      <div className="eyebrow">Season Management</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:10}}>Start a new season</h2>
      <p style={{fontSize:13,color:C.muted,marginTop:0}}>
        Create a new blank season container. Once created, you can begin building its tournament schedule. All previous seasons will remain untouched as a read-only archive.
      </p>

      <div style={{display:"flex",gap:12,marginBottom:16,marginTop:16,flexWrap:"wrap"}}>
        <label style={{flex:1, minWidth: 100}}>
          <span style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>Year</span>
          <input type="number" value={year} onChange={handleYearChange} />
        </label>
        <label style={{flex:2, minWidth: 200}}>
          <span style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>Season Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </div>

      <button className="btn" onClick={createSeason}>Create Season</button>
      
      {status && <p style={{color:C.fairway,fontSize:13,marginTop:12,fontWeight:600}}>{status}</p>}
    </div>
  );
}
function MigrationTool({ state }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (msg) => setLogs(prev => [...prev, msg]);

  const runMigration = async () => {
    setLoading(true);
    setLogs([]); 
    log("🚀 Resuming data migration...");

    try {
      // 1. Get or Create Season
      log("1️⃣ Syncing 2026 Season...");
      const { data: season, error: sErr } = await supabase
        .from('seasons')
        .upsert({ year: 2026, name: '2026 Season', status: 'active' }, { onConflict: 'year' })
        .select()
        .single();
        
      if (sErr) throw new Error("Season sync failed: " + sErr.message);
      log("✅ Season ready! ID: " + season.id);

      // 2. Read and Format Local Data
      log("2️⃣ Formatting local schedule and golfers...");
      const localGolfers = Object.entries(state.golfers || {}).map(([key, val]) => {
        if (typeof val === 'string') return { espn_id: key, name: val };
        return { espn_id: key, ...val };
      });
      
      const localTournaments = SEED_TOURNAMENTS;
      log(`Prepared ${localTournaments.length} tournaments and ${localGolfers.length} golfers.`);

      // 3. Push Golfers
      if (localGolfers.length > 0) {
        log("3️⃣ Uploading Golfer Pool...");
        const { error: gErr } = await supabase.from('golfers').upsert(localGolfers);
        if (gErr) throw new Error("Golfer upload failed: " + gErr.message);
        log("✅ Golfers uploaded!");
      }

      // 4. Push Tournaments (Fixed Schema Mapping)
      if (localTournaments.length > 0) {
        log("4️⃣ Uploading Schedule...");
        const tourneysWithSeason = localTournaments.map((t, index) => ({
          season_id: season.id,
          ordinal: index + 1,
          name: t.name,
          course: t.course,
          date_label: t.date,
          espn_event_id: t.espnId || null
        }));
        
        const { error: tErr } = await supabase
          .from('tournaments')
          .upsert(tourneysWithSeason, { onConflict: 'season_id, ordinal' });
          
        if (tErr) throw new Error("Tournament upload failed: " + tErr.message);
        log("✅ Schedule uploaded!");
      }

      // 5. Setup Profiles & Entries
      log("5️⃣ Syncing Profiles and Season Entries...");
      const { data: dbTournaments } = await supabase.from('tournaments').select('id, ordinal');
      const { data: dbGolfers } = await supabase.from('golfers').select('espn_id, name');

      const { data: existingProfiles } = await supabase.from('profiles').select('id, email');
      const profileMap = new Map(existingProfiles?.map(p => [p.email, p.id]));

      const newProfiles = [];
      SEED_MEMBERS.forEach(m => {
        if (!profileMap.has(m.email)) {
          const newId = crypto.randomUUID(); 
          newProfiles.push({ id: newId, name: m.name, email: m.email, is_admin: m.isAdmin });
          profileMap.set(m.email, newId);
        }
      });

      if (newProfiles.length > 0) {
        const { error: pErr } = await supabase.from('profiles').insert(newProfiles);
        if (pErr) throw new Error("Profile creation failed: " + pErr.message);
      }

      const { data: existingEntries } = await supabase.from('season_entries').select('id, profile_id').eq('season_id', season.id);
      const entryMap = new Map(existingEntries?.map(e => [e.profile_id, e.id]));

      const newEntries = [];
      SEED_MEMBERS.forEach(m => {
        const pid = profileMap.get(m.email);
        if (!entryMap.has(pid)) {
          newEntries.push({ season_id: season.id, profile_id: pid, status: 'active' });
        }
      });

      if (newEntries.length > 0) {
        const { data: insertedEntries, error: eErr } = await supabase.from('season_entries').insert(newEntries).select();
        if (eErr) throw new Error("Entry creation failed: " + eErr.message);
        insertedEntries?.forEach(e => entryMap.set(e.profile_id, e.id));
      }

      // 6. Push Historical Picks
      log("6️⃣ Translating historical picks...");
      const picksToInsert = [];
      
      const tMap = {};
      SEED_TOURNAMENTS.forEach((t, i) => {
        const dbT = dbTournaments?.find(dt => dt.ordinal === i + 1);
        if (dbT) tMap[t.id] = dbT.id;
      });

      const gMap = {};
      dbGolfers?.forEach(g => { gMap[g.name] = g.espn_id; });
      Object.entries(state.golfers || {}).forEach(([espn_id, data]) => {
          const name = typeof data === 'string' ? data : data.name;
          gMap[name] = espn_id; 
      });

      Object.entries(state.picks).forEach(([email, picks]) => {
        const pid = profileMap.get(email);
        const entryId = entryMap.get(pid);
        if (!entryId) return;

        Object.entries(picks).forEach(([localTid, pick]) => {
          if (!pick.golfer) return;
          const tourneyId = tMap[localTid];

          if (tourneyId) {
            picksToInsert.push({
              entry_id: entryId,
              tournament_id: tourneyId,
              golfer_espn_id: gMap[pick.golfer] || null,
              golfer_name: pick.golfer,
              points: pick.points
            });
          }
        });
      });

      log(`Found ${picksToInsert.length} picks to migrate.`);
      const { error: pickErr } = await supabase.from('picks').upsert(picksToInsert, { onConflict: 'entry_id, tournament_id' });
      if (pickErr) throw new Error("Picks upload failed: " + pickErr.message);

      log("🎉 Phase 3 Complete! Your historical data is safe in the cloud.");

    } catch (error) {
      log("❌ " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="eyebrow" style={{color: "#d94833"}}>One-Time Migration</div>
      <h2 style={{fontSize:22,marginTop:6,marginBottom:10}}>Push Local Data to Supabase</h2>
      <p style={{fontSize:13,color:"#666",marginTop:0}}>
        This tool will safely transfer your hardcoded 2026 schedule and data to the cloud database.
      </p>
      <button className="btn" onClick={runMigration} disabled={loading} style={{background:"#d94833"}}>
        {loading ? "Migrating..." : "Run Database Migration"}
      </button>

      {logs.length > 0 && (
        <div style={{marginTop: 20, background: "#f1f3f5", padding: 16, borderRadius: 8, fontSize: 13, fontFamily: "monospace", color: "#333", whiteSpace: "pre-wrap", border: "1px solid #ddd"}}>
          {logs.join('\n')}
        </div>
      )}
    </div>
  );
} 