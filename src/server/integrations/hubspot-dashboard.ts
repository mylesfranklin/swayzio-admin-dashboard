import { getOrCompute } from "@/server/cache";
import {
  getContactCounts,
  getProDistribution,
  getContactGrowth,
  getPowerUsers,
  getCatalogScan,
  getEnumDistribution,
  getUpsellTargets,
  type PowerUser,
  type Company,
  type UpsellTargets,
} from "./hubspot";

const MIN = 60 * 1000;

export interface HubspotDashboard {
  totalContacts: number;
  artists: number;
  subscribed: number;
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
  upsell: UpsellTargets;
  acquisitionChannels: Array<{ label: string; value: number }>;
  roleDistribution: Array<{ label: string; value: number }>;
  companyTypeDistribution: Array<{ label: string; value: number }>;
  updatedAt: string | null;
  stale: boolean;
}

export async function getHubspotDashboard(): Promise<HubspotDashboard> {
  const [counts, pro, growth, power, catalog, upsell, acquisition, roles, companyTypes] = await Promise.all([
    getOrCompute("hubspot:counts", getContactCounts, 15 * MIN),
    getOrCompute("hubspot:pro", getProDistribution, 30 * MIN),
    getOrCompute("hubspot:growth", getContactGrowth, 6 * 60 * MIN),
    getOrCompute("hubspot:power-users", () => getPowerUsers(50), 30 * MIN),
    getOrCompute("hubspot:catalog", () => getCatalogScan(40), 60 * MIN),
    getOrCompute("hubspot:upsell", () => getUpsellTargets(200), 30 * MIN),
    getOrCompute("hubspot:acquisition", () => getEnumDistribution("acquisition_channel"), 60 * MIN),
    getOrCompute("hubspot:roles", () => getEnumDistribution("role"), 60 * MIN),
    getOrCompute("hubspot:company-types", () => getEnumDistribution("company_type"), 60 * MIN),
  ]);

  const c = counts.data;
  const subscribedConvPct = c.artists > 0 ? Math.round((c.subscribed / c.artists) * 1000) / 10 : 0;

  const cached = [counts, pro, growth, power, catalog, upsell, acquisition, roles, companyTypes];
  const updatedAt = cached.map((x) => x.meta.updatedAt).filter(Boolean).sort().slice(-1)[0] ?? null;
  const stale = cached.some((x) => x.meta.stale);

  return {
    totalContacts: c.totalContacts,
    artists: c.artists,
    subscribed: c.subscribed,
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
    upsell: upsell.data,
    acquisitionChannels: acquisition.data,
    roleDistribution: roles.data,
    companyTypeDistribution: companyTypes.data,
    updatedAt,
    stale,
  };
}
