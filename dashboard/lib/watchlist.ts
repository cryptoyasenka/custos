// Hardcoded mainnet watchlist for the live feed UI.
// Source: .planning/MAINNET-WATCHLIST.md (12 verified PDAs from
// solana-labs/governance-ui/public/realms/mainnet-beta.json).
// Order matches the daemon's CUSTOS_WATCH env string for Tier 1 + Tier 2.

export interface WatchedDao {
  name: string;
  symbol: string;
  programId: string;
  account: string;
  realmsLink: string;
  tier: 1 | 2;
}

export const WATCHLIST: WatchedDao[] = [
  {
    name: "Mango DAO",
    symbol: "MNGO",
    programId: "GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J",
    account: "DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE",
    realmsLink: "https://app.realms.today/dao/MNGO",
    tier: 1,
  },
  {
    name: "Marinade",
    symbol: "MNDE",
    programId: "GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs",
    account: "899YG3yk4F66ZgbNWLHriZHTXSKk9e1kvsKEquW7L6Mo",
    realmsLink: "https://app.realms.today/dao/MNDE",
    tier: 1,
  },
  {
    name: "Pyth Network",
    symbol: "PYTH",
    programId: "pytGY6tWRgGinSCvRLnSv4fHfBTMoiDGiCsesmHWM6U",
    account: "4ct8XU5tKbMNRphWy4rePsS9kBqPhDdvZoGpmprPaug4",
    realmsLink: "https://app.realms.today/dao/PYTH",
    tier: 1,
  },
  {
    name: "Solend DAO",
    symbol: "SLND",
    programId: "A7kmu2kUcnQwAVn8B4znQmGJeUrsJ1WEhYVMtmiBLkEr",
    account: "7sf3tcWm58vhtkJMwuw2P3T6UBX7UE5VKxPMnXJUZ1Hn",
    realmsLink: "https://app.realms.today/dao/SLND",
    tier: 1,
  },
  {
    name: "Jupiter",
    symbol: "JUP",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "2Z5BXuRCJPqYUCBGyQTwAXHeJoFAnbtvoXja19aZFLKY",
    realmsLink: "https://app.realms.today/dao/Jupiter",
    tier: 1,
  },
  {
    name: "Raydium",
    symbol: "RAY",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "8JZdqeTaMkPaatN8xKRXRHeSGSrNLSMAT5vWQjdNp7K",
    realmsLink: "https://app.realms.today/dao/RAY",
    tier: 1,
  },
  {
    name: "Orca",
    symbol: "ORCA",
    programId: "J9uWvULFL47gtCPvgR3oN7W357iehn5WF2Vn9MJvcSxz",
    account: "66Du7mXgS2KMQBUk6m9h3TszMjqZqdWhsG3Duuf69VNW",
    realmsLink: "https://app.realms.today/dao/ORCA",
    tier: 1,
  },
  {
    name: "BonkDAO",
    symbol: "BONK",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "84pGFuy1Y27ApK67ApethaPvexeDWA66zNV8gm38TVeQ",
    realmsLink: "https://app.realms.today/dao/BONK",
    tier: 1,
  },
  {
    name: "Helius",
    symbol: "HELI",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "VAf2xnozMTWeytjUU4GtoyqrGj63owBENr754Y3bzL5",
    realmsLink: "https://app.realms.today/dao/Helius",
    tier: 2,
  },
  {
    name: "Squads",
    symbol: "SQDS",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "BzGL6wbCvBisQ7s1cNQvDGZwDRWwKK6bhrV93RYdetzJ",
    realmsLink: "https://app.realms.today/dao/Squads",
    tier: 2,
  },
  {
    name: "Superteam",
    symbol: "SUPE",
    programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    account: "5NNv1oJ4PFhE2416kTNDzrR9axoHjBTw2CNABqcYpXXL",
    realmsLink: "https://app.realms.today/dao/Superteam",
    tier: 2,
  },
  {
    name: "MonkeDAO",
    symbol: "MONK",
    programId: "GMnke6kxYvqoAXgbFGnu84QzvNHoqqTnijWSXYYTFQbB",
    account: "B1CxhV1khhj7n5mi5hebbivesqH9mvXr5Hfh2nD2UCh6",
    realmsLink: "https://app.realms.today/dao/MonkeDAO",
    tier: 2,
  },
];
