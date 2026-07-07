import { getOrCompute } from "@/server/cache";
import { getOsHubspotDashboard } from "@/server/os/dashboard";
import {
  getContactCounts,
  getActiveSubscribers,
  type ActiveSubscribers,
  getProDistribution,
  getContactGrowth,
  getPowerUsers,
  getCatalogScan,
  getEnumDistribution,
  getReacquireCandidates,
  type PowerUser,
  type Company,
  type ReacquireCandidates,
} from "./hubspot";

const MIN = 60 * 1000;

export interface HubspotDashboard {
  totalContacts: number;
  artists: number;
  subscribed: number;
  activeSubscribers: ActiveSubscribers; // subscribed + logged in within 30 / 60 days
  subscribedConvPct: number; // subscribed ÷ artists
  signedToDeal: number;
  hasPro: number;
  taggedTracksTotal: number;
  untaggedTracksTotal: number;
  totalTracks: number;
  artistsWithTracks: number;
  proDistribution: Array<{ label: string; value: number }>;
  growthByMonth: Array<{ month: string; contacts: number }>;
  powerUsers: PowerUser[];
  companies: Company[];
  reacquire: ReacquireCandidates;
  acquisitionChannels: Array<{ label: string; value: number }>;
  roleDistribution: Array<{ label: string; value: number }>;
  companyTypeDistribution: Array<{ label: string; value: number }>;
  updatedAt: string | null;
  stale: boolean;
}

export async function getHubspotDashboard(): Promise<HubspotDashboard> {
  const os = await getOsHubspotDashboard();
  if (os) return os;

  const [counts, activeSubs, pro, growth, power, catalog, reacquire, acquisition, roles, companyTypes] = await Promise.all([
    getOrCompute("hubspot:counts", getContactCounts, 15 * MIN),
    getOrCompute("hubspot:active-subs", getActiveSubscribers, 30 * MIN),
    getOrCompute("hubspot:pro", getProDistribution, 30 * MIN),
    getOrCompute("hubspot:growth", getContactGrowth, 6 * 60 * MIN),
    getOrCompute("hubspot:power-users", () => getPowerUsers(100), 30 * MIN),
    getOrCompute("hubspot:catalog", () => getCatalogScan(40), 60 * MIN),
    getOrCompute("hubspot:reacquire", () => getReacquireCandidates(200), 30 * MIN),
    getOrCompute("hubspot:acquisition", () => getEnumDistribution("acquisition_channel"), 60 * MIN),
    getOrCompute("hubspot:roles", () => getEnumDistribution("role"), 60 * MIN),
    getOrCompute("hubspot:company-types", () => getEnumDistribution("company_type"), 60 * MIN),
  ]);

  const c = counts.data;
  const subscribedConvPct = c.artists > 0 ? Math.round((c.subscribed / c.artists) * 1000) / 10 : 0;

  const cached = [counts, activeSubs, pro, growth, power, catalog, reacquire, acquisition, roles, companyTypes];
  const updatedAt = cached.map((x) => x.meta.updatedAt).filter(Boolean).sort().slice(-1)[0] ?? null;
  const stale = cached.some((x) => x.meta.stale);

  return {
    totalContacts: c.totalContacts,
    artists: c.artists,
    subscribed: c.subscribed,
    activeSubscribers: activeSubs.data,
    subscribedConvPct,
    signedToDeal: c.signedToDeal,
    hasPro: c.hasPro,
    taggedTracksTotal: catalog.data.taggedTracksTotal,
    untaggedTracksTotal: catalog.data.untaggedTracksTotal,
    totalTracks: catalog.data.taggedTracksTotal + catalog.data.untaggedTracksTotal,
    artistsWithTracks: catalog.data.artistsWithTracks,
    proDistribution: pro.data,
    growthByMonth: growth.data,
    powerUsers: power.data,
    companies: catalog.data.companies,
    reacquire: reacquire.data,
    acquisitionChannels: acquisition.data,
    roleDistribution: roles.data,
    companyTypeDistribution: companyTypes.data,
    updatedAt,
    stale,
  };
}
