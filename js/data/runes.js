// Rune Simulator — furyfoxIII
(function () {

window.RS = window.RS || {};

RS.RuneDatabase = [

    {
        name: "Realm 1",
        openingRunes: [
            {
                name: "Basic",

                cost: {
                    currency: "Fire",
                    amount: "41.4"
                },

                drops: [
                    {
                        name: "Rookie",
                        baseChance: "1.25",
                        type: "Basic",
                        cap: "1.25"
                    },

                    {
                        name: "Learner",
                        baseChance: "6.67",
                        type: "Basic",
                        cap: "6.67"
                    },
                    
                    {
                        name: "Trained",
                        baseChance: "33.29",
                        type: "Basic",
                        cap: "10"
                    },
                    
                    {
                        name: "Skilled",
                        baseChance: "200",
                        type: "Basic",
                        cap: "10"
                    },
                    
                    {
                        name: "Expert",
                        baseChance: "50K",
                        type: "Basic",
                        cap: "10"
                    },
                    
                    {
                        name: "Master",
                        baseChance: "1M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Grandmaster",
                        baseChance: "40M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Celestial",
                        baseChance: "625B",
                        type: "Basic",
                        cap: "15.1",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Immortal",
                        baseChance: "500Sp",
                        type: "Basic",
                        cap: "468",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Shadow",
                        baseChance: "2.5Sx",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Phantom",
                        baseChance: "2.5Oc",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Atomic",
                        baseChance: "300QdDe",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Chronos Core",
                        baseChance: "3.5QnDe",
                        type: "Noobinial"
                    },
                ]

            },

            {
                name: "Super",

                cost: {
                    currency: "Cash",
                    amount: "20.7K"
                },

                drops: [
                    {
                        name: "Initiate",
                        baseChance: "1.11",
                        type: "Basic",
                        cap: "1.11"
                    },

                    {
                        name: "Adept",
                        baseChance: "13.3",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Veteran",
                        baseChance: "50",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Elite",
                        baseChance: "5K",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Champion",
                        baseChance: "200K",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Ascended",
                        baseChance: "2M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Transcendent",
                        baseChance: "50M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Universal",
                        baseChance: "20Qn",
                        type: "Basic",
                        cap: "85.1",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Omnipotent",
                        baseChance: "12.5Oc",
                        type: "Basic",
                        cap: "645",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Eclipse",
                        baseChance: "250Sx",
                        type: "Noobinial"
                    },

                    {
                        name: "Void",
                        baseChance: "2.5No",
                        type: "Noobinial"
                    },

                    {
                        name: "Primordial",
                        baseChance: "5UDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Oblivion Sigil",
                        baseChance: "300QnDe",
                        type: "Noobinial"
                    },
                ]
            },

            {
                name: "Advanced",

                cost: {
                    currency: "Bread",
                    amount: "20.7"
                },

                drops: [
                    {
                        name: "Little",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },

                    {
                        name: "Lesser",
                        baseChance: "100K",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Standard",
                        baseChance: "1M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Greater",
                        baseChance: "50M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Superior",
                        baseChance: "200M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Prime",
                        baseChance: "100B",
                        type: "Basic",
                        cap: "12.6",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Apex",
                        baseChance: "1T",
                        type: "Basic",
                        cap: "15.8",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Ethereal",
                        baseChance: "50T",
                        type: "Basic",
                        cap: "23.4",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Divine",
                        baseChance: "200Qd",
                        type: "Basic",
                        cap: "53.7",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Infinite",
                        baseChance: "17.5Oc",
                        type: "Basic",
                        cap: "667",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Abyss",
                        baseChance: "25Sp",
                        type: "Noobinial"
                    },

                    {
                        name: "Enigma",
                        baseChance: "2.5De",
                        type: "Noobinial"
                    },

                    {
                        name: "Seraphim's Tear",
                        baseChance: "100TDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Aetherion",
                        baseChance: "12.5SxDe",
                        type: "Noobinial"
                    },
                ]
            },

            {
                name: "Cosmic Prism",

                cost: {
                    currency: "Prism",
                    amount: "2.49"
                },

                drops: [
                    {
                        name: "Luscent",
                        baseChance: "2.5",
                        type: "Basic",
                        cap: "2.5"
                    },

                    {
                        name: "Chroma",
                        baseChance: "4",
                        type: "Basic",
                        cap: "4"
                    },

                    {
                        name: "Fractal",
                        baseChance: "20",
                        type: "Basic",
                        cap: "20"
                    },

                    {
                        name: "Refraction",
                        baseChance: "100",
                        type: "Basic",
                        cap: "100"
                    },

                    {
                        name: "Tessellation",
                        baseChance: "200",
                        type: "Basic",
                        cap: "200"
                    },

                    {
                        name: "Hyperlight",
                        baseChance: "333",
                        type: "Basic",
                        cap: "333"
                    },

                    {
                        name: "Prism God",
                        baseChance: "1K",
                        type: "Basic",
                        cap: "1K"
                    },

                    {
                        name: "Void Glass",
                        baseChance: "1M",
                        type: "Basic",
                        cap: "1M"
                    },

                    {
                        name: "Godshard",
                        baseChance: "100M",
                        type: "Noobinial"
                    },

                    {
                        name: "Ultimate Shard",
                        baseChance: "250B",
                        type: "Noobinial"
                    },
                ]
            },

            {
                name: "Hacker",

                cost: {
                    currency: "HackPoints",
                    amount: "352"
                },

                drops: [
                    {
                        name: "Script",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },
                    
                    {
                        name: "Protocol",
                        baseChance: "100Qd",
                        type: "Basic",
                        cap: "50.1"
                    },
                    
                    {
                        name: "Cypher",
                        baseChance: "10Sx",
                        type: "Basic",
                        cap: "158"
                    },
                    
                    {
                        name: "Expliot",
                        baseChance: "1000Sp",
                        type: "Basic",
                        cap: "501",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Kernel",
                        baseChance: "1No",
                        type: "Basic",
                        cap: "1K",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Root",
                        baseChance: "1De",
                        type: "Basic",
                        cap: "2K",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Backdoor",
                        baseChance: "1UDe",
                        type: "Basic",
                        cap: "3.98k",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Rootkit",
                        baseChance: "1Oc",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Masterkey",
                        baseChance: "20Oc",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Stuxnet",
                        baseChance: "52.4No",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Glitched",
                        baseChance: "50Vt",
                        type: "Basic",
                        yieldMultiplier: 0.491
                    },
                    
                    {
                        name: "Firewall",
                        baseChance: "20TVt",
                        type: "Basic",
                        yieldMultiplier: 0.491
                    },
                    
                    {
                        name: "Connor Hacked It",
                        baseChance: "75SxVt",
                        type: "Basic",
                        yieldMultiplier: 0.491
                    },
                    
                    {
                        name: "Anti-Cheat",
                        baseChance: "2OcVt",
                        type: "Basic",
                        yieldMultiplier: 0.491
                    },
                    
                    {
                        name: "Unstoppable Virus",
                        baseChance: "1DVt",
                        type: "Noobinial"
                    },
                ]
            }
        ]
    },

    {
        name: "Realm 2",
        openingRunes: [
            {
                name: "Snowy",

                cost: {
                    currency: "Ice",
                    amount: "827.99K"
                },

                drops: [
                    {
                        name: "Snow",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1545
                    },

                    {
                        name: "Frost",
                        baseChance: "1Qn",
                        type: "Basic",
                        cap: "63.1",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Ice",
                        baseChance: "100Qn",
                        type: "Basic",
                        cap: "100",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Hail",
                        baseChance: "2Sx",
                        type: "Basic",
                        cap: "135",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Glacier",
                        baseChance: "100Sp",
                        type: "Basic",
                        cap: "398",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Blizzard",
                        baseChance: "500DDe",
                        type: "Basic",
                        cap: "14.8k",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Tundra",
                        baseChance: "2QdDe",
                        type: "Basic",
                        cap: "33.9k",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Artic",
                        baseChance: "400OcDe",
                        type: "Basic",
                        yieldMultiplier: 0.486
                    },

                    {
                        name: "Permafrost",
                        baseChance: "190Vt",
                        type: "Basic",
                        yieldMultiplier: 0.486
                    },

                    {
                        name: "Whiteout",
                        baseChance: "500SxDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Icebound",
                        baseChance: "500SpDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Everfrost",
                        baseChance: "150OcDe",
                        type: "Noobinial"
                    },
                ]
            },

            {
                name: "Deepcore",

                cost: {
                    currency: "Gem",
                    amount: "20.7K"
                },

                drops: [
                    {
                        name: "Dust",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1546
                    },

                    {
                        name: "Pebble",
                        baseChance: "10Sx",
                        type: "Basic",
                        cap: "158",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Hollow",
                        baseChance: "20Sx",
                        type: "Basic",
                        cap: "170",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Echo",
                        baseChance: "10Sp",
                        type: "Basic",
                        cap: "316",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Stalagmite",
                        baseChance: "200Sp",
                        type: "Basic",
                        cap: "427",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Cavern",
                        baseChance: "50Oc",
                        type: "Basic",
                        cap: "741",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Crystalborn",
                        baseChance: "10No",
                        type: "Basic",
                        cap: "1.26K",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Earthshaker",
                        baseChance: "10De",
                        type: "Basic",
                        cap: "2.5K",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Golemheart",
                        baseChance: "100UDe",
                        type: "Basic",
                        cap: "6.31k",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Stone Titan",
                        baseChance: "10No",
                        type: "Noobinial"
                    },

                    {
                        name: "Cave Guardian",
                        baseChance: "7.5De",
                        type: "Noobinial"
                    },

                    {
                        name: "Deep Spirit",
                        baseChance: "250De",
                        type: "Noobinial"
                    },
                ]
            },

            {
                name: "Shard",

                cost: {
                    currency: "Gem",
                    amount: "249T"
                },

                drops: [
                    {
                        name: "Air Shard",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },

                    {
                        name: "Water Shard",
                        baseChance: "1.5QdVt",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Earth Shard",
                        baseChance: "400QnVt",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Fire Shard",
                        baseChance: "75SpVt",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Ice Shard",
                        baseChance: "12NoVt",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Poison Shard",
                        baseChance: "125UTg",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Metal Shard",
                        baseChance: "1.5e104",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Light Shard",
                        baseChance: "3.2e106",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Shadow Shard",
                        baseChance: "4.0e108",
                        type: "Basic",
                        yieldMultiplier: 0.436
                    },

                    {
                        name: "Galactic Shard",
                        baseChance: "5QdVt",
                        type: "Noobinial"
                    },

                    {
                        name: "Elemental Shard",
                        baseChance: "100QdVt",
                        type: "Noobinial"
                    },

                    {
                        name: "Dragon Shard",
                        baseChance: "2QnVt",
                        type: "Noobinial"
                    },
                ]
            }
        ]
    },

    {
        name: "Realm 3",

        openingRunes: [

            {
                name: "Dunes",

                cost: {
                    currency: "Bones",
                    amount: "82.8K"
                },


                drops: [

                    {
                        name: "Marrow",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1419
                    },

                    {
                        name: "Femur",
                        baseChance: "333K",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Skull",
                        baseChance: "1B",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Dune",
                        baseChance: "375B",
                        type: "Basic",
                        cap: "14.4",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Oasis",
                        baseChance: "43.5Qd",
                        type: "Basic",
                        cap: "46.1",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Mirage",
                        baseChance: "250Qn",
                        type: "Basic",
                        cap: "110",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Sunspire",
                        baseChance: "4.29Sp",
                        type: "Basic",
                        cap: "291",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Eternal Sand",
                        baseChance: "5.08Oc",
                        type: "Basic",
                        cap: "590",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Sphinx",
                        baseChance: "30DDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Anubis",
                        baseChance: "75NoDe",
                        type: "Noobinial"
                    },

                    {
                        name: "Ancient Fragment",
                        baseChance: "35Vt",
                        type: "Noobinial"
                    }

                ]

            },

            {
                name: "Sunfire",

                cost: {
                    currency: "Sand",
                    amount: "82.8"
                },

                drops: [
                    {
                        name: "Ashen",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1474
                    },
                    
                    {
                        name: "Parched",
                        baseChance: "43.5M",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Cactus",
                        baseChance: "6.9B",
                        type: "Basic",
                        cap: "10",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Scorch",
                        baseChance: "3.65T",
                        type: "Basic",
                        cap: "18",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Spark",
                        baseChance: "44.6Sx",
                        type: "Basic",
                        cap: "184",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Flare",
                        baseChance: "4.34Oc",
                        type: "Basic",
                        cap: "581",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Desert Jewel",
                        baseChance: "7.52UDe",
                        type: "Basic",
                        cap: "4.87k",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Solar Titan",
                        baseChance: "2.67QdDe",
                        type: "Basic",
                        cap: "34.9k",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Immortal Sun",
                        baseChance: "3.94SpDe",
                        type: "Basic",
                        yieldMultiplier: 0.4
                    },
                    
                    {
                        name: "Pharaoh",
                        baseChance: "200NoDe",
                        type: "Noobinial",
                    },
                    
                    {
                        name: "Horus",
                        baseChance: "1.5Vt",
                        type: "Noobinial",
                    },
                    
                    {
                        name: "Secrets of Egypt",
                        baseChance: "300Vt",
                        type: "Noobinial",
                    },
                ]
            },

            {
                name: "Sunstorm Prism",
                
                cost: {
                    currency: "Prism",
                    amount: "4.13"
                },

                drops: [
                    {
                        name: "Cinderfall",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },

                    {
                        name: "Shadowflare",
                        baseChance: "1.5B",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Dawnshard",
                        baseChance: "75B",
                        type: "Basic",
                        cap: "12.2"
                    },

                    {
                        name: "Lumina",
                        baseChance: "1.25T",
                        type: "Basic"
                    },

                    {
                        name: "Pyrestone",
                        baseChance: "22.5T",
                        type: "Basic"
                    },

                    {
                        name: "Helios",
                        baseChance: "500Qd",
                        type: "Basic"
                    },

                    {
                        name: "Starforge",
                        baseChance: "20Qd",
                        type: "Basic"
                    },

                    {
                        name: "Celestia",
                        baseChance: "1.5Qn",
                        type: "Basic"
                    },

                    {
                        name: "Eternis",
                        baseChance: "75T",
                        type: "Noobinial",
                    },

                    {
                        name: "Omnira",
                        baseChance: "1.25Qd",
                        type: "Noobinial",
                    },
                ]
            }

        ]

    },

    {
        name: "Realm 4",

        openingRunes: [

            {
                name: "Starlight",

                cost: {
                    currency: "Moon",
                    amount: "82.8"
                },


                drops: [
                    {
                        name: "Moonlight",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1555
                    },

                    {
                        name: "Sunlight",
                        baseChance: "500DDe",
                        type: "Basic",
                        cap: "3.71k",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Invasion",
                        baseChance: "80DDe",
                        type: "Basic",
                        cap: "12.3k",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Alien",
                        baseChance: "225QdDe",
                        type: "Basic",
                        cap: "54.4k",
                        yieldMultiplier: 0.25
                    },

                    {
                        name: "Universe",
                        baseChance: "925SpDe",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Gravity",
                        baseChance: "15UVt",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Dimentional",
                        baseChance: "1QnVt",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Meteor",
                        baseChance: "75UTg",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Nebula",
                        baseChance: "2DTg",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },

                    {
                        name: "Supernova",
                        baseChance: "200DVt",
                        type: "Noobinial"
                    },

                    {
                        name: "Galactic Chaos",
                        baseChance: "2.25TVt",
                        type: "Noobinial"
                    },

                    {
                        name: "Chaotic Destruction",
                        baseChance: "15Qnvt",
                        type: "Noobinial"
                    }
                ]

            },

            {
                name: "Cosma",

                cost: {
                    currency: "Knowledge",
                    amount: "4.13M"
                },


                drops: [
                    {
                        name: "Asteroid",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01",
                        yieldMultiplier: 1.1538
                    },

                    {
                        name: "Comet",
                        baseChance: "150UDe",
                        type: "Basic",
                        cap: "6.57k",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Satellite",
                        baseChance: "3QdDe",
                        type: "Basic",
                        cap: "35.29k",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Orbit",
                        baseChance: "700SxDe",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Cluster",
                        baseChance: "17.5NoDe",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Quasar",
                        baseChance: "525QdVt",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Pulsar",
                        baseChance: "2.5e101",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Black Hole",
                        baseChance: "1.0e103",
                        type: "Basic",
                        yieldMultiplier: 0.5
                    },
                    
                    {
                        name: "Magnetar",
                        baseChance: "7.5TVt",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Event Horizon",
                        baseChance: "50TVt",
                        type: "Noobinial"
                    },
                    
                    {
                        name: "Elemental Creation",
                        baseChance: "200QnVt",
                        type: "Noobinial"
                    }
                ]

            },

            {
                name: "Light",

                cost: {
                    currency: "Yang",
                    amount: "104Qd"
                },


                drops: [
                    {
                        name: "White",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },

                    {
                        name: "Divine Light",
                        baseChance: "15NoDe",
                        type: "Basic"
                    },

                    {
                        name: "Daylight",
                        baseChance: "1TVt",
                        type: "Basic"
                    },

                    {
                        name: "Elemental Of Light",
                        baseChance: "1SpVt",
                        type: "Basic"
                    },

                    {
                        name: "Protected",
                        baseChance: "1UTg",
                        type: "Basic"
                    },

                    {
                        name: "Creation",
                        baseChance: "1.0e108",
                        type: "Basic"
                    },

                    {
                        name: "Angelic Goodness",
                        baseChance: "1.0e120",
                        type: "Basic"
                    },

                    {
                        name: "Absolute Divinity",
                        baseChance: "100SxVt",
                        type: "Noobinial"
                    }
                ]

            },

            {
                name: "Dark",

                cost: {
                    currency: "Yang",
                    amount: "104Qd"
                },


                drops: [
                    {
                        name: "Dark",
                        baseChance: "1.01",
                        type: "Basic",
                        cap: "1.01"
                    },

                    {
                        name: "Infinite Darkness",
                        baseChance: "1Vt",
                        type: "Basic"
                    },

                    {
                        name: "Midnight",
                        baseChance: "1TVt",
                        type: "Basic"
                    },

                    {
                        name: "Dark Elemental",
                        baseChance: "1SpVt",
                        type: "Basic"
                    },

                    {
                        name: "Doomed",
                        baseChance: "1UTg",
                        type: "Basic"
                    },

                    {
                        name: "Destruction",
                        baseChance: "1.0e108",
                        type: "Basic"
                    },

                    {
                        name: "Demonic Evil",
                        baseChance: "1.0e120",
                        type: "Basic"
                    },

                    {
                        name: "Absolute Darkness",
                        baseChance: "2.5SpVt",
                        type: "Noobinial"
                    }
                ]

            }
        ]
    },

    {
        name: "Events",
        openingRunes: [
            {
                name: "Football",
                cost: {
                    currency: "Goal",
                    amount: "99.4B",
                },

                drops: [
                    {
                        name: "Scuff",
                        baseChance: "1.12",
                        type: "Basic",
                        cap: "1.12"
                    },

                    {
                        name: "Fade",
                        baseChance: "10",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Stitch",
                        baseChance: "1K",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Kickoff",
                        baseChance: "100K",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Dribble",
                        baseChance: "10M",
                        type: "Basic",
                        cap: "10"
                    },

                    {
                        name: "Tackle",
                        baseChance: "1T",
                        type: "Basic",
                        cap: "15.8"
                    },

                    {
                        name: "Corner",
                        baseChance: "100Qd",
                        type: "Basic",
                        cap: "50.1"
                    },

                    {
                        name: "Volley",
                        baseChance: "10Sx",
                        type: "Basic"
                    },

                    {
                        name: "Header",
                        baseChance: "100No",
                        type: "Basic"
                    },

                    {
                        name: "Finale",
                        baseChance: "1Sx",
                        type: "Noobinial"
                    },

                    {
                        name: "Victory",
                        baseChance: "100Sx",
                        type: "Noobinial"
                    },

                    {
                        name: "Iconic",
                        baseChance: "2.5Sp",
                        type: "Noobinial"
                    },
                ]
            }
        ]
    }

];

})();
