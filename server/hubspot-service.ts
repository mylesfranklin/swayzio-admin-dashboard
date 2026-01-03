import { Client } from '@hubspot/api-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

export async function getUncachableHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

export interface HubSpotContact {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  company?: string;
  lifecyclestage?: string;
  createdate?: string;
  lastmodifieddate?: string;
}

export interface HubSpotCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  numberofemployees?: number;
  annualrevenue?: number;
  city?: string;
  state?: string;
  country?: string;
  createdate?: string;
}

export interface HubSpotDeal {
  id: string;
  dealname: string;
  amount?: number;
  dealstage: string;
  pipeline?: string;
  closedate?: string;
  createdate?: string;
  hs_lastmodifieddate?: string;
}

export class HubSpotService {
  async getContacts(limit: number = 100): Promise<HubSpotContact[]> {
    try {
      const client = await getUncachableHubSpotClient();
      const response = await client.crm.contacts.basicApi.getPage(
        limit,
        undefined,
        ['email', 'firstname', 'lastname', 'phone', 'company', 'lifecyclestage', 'createdate', 'lastmodifieddate']
      );
      
      return response.results.map((contact: any) => ({
        id: contact.id,
        email: contact.properties.email || '',
        firstname: contact.properties.firstname || '',
        lastname: contact.properties.lastname || '',
        phone: contact.properties.phone,
        company: contact.properties.company,
        lifecyclestage: contact.properties.lifecyclestage,
        createdate: contact.properties.createdate,
        lastmodifieddate: contact.properties.lastmodifieddate
      }));
    } catch (error: any) {
      console.error('Error fetching HubSpot contacts:', error.message);
      throw error;
    }
  }

  async getCompanies(limit: number = 100): Promise<HubSpotCompany[]> {
    try {
      const client = await getUncachableHubSpotClient();
      const response = await client.crm.companies.basicApi.getPage(
        limit,
        undefined,
        ['name', 'domain', 'industry', 'numberofemployees', 'annualrevenue', 'city', 'state', 'country', 'createdate']
      );
      
      return response.results.map((company: any) => ({
        id: company.id,
        name: company.properties.name || '',
        domain: company.properties.domain,
        industry: company.properties.industry,
        numberofemployees: company.properties.numberofemployees ? parseInt(company.properties.numberofemployees) : undefined,
        annualrevenue: company.properties.annualrevenue ? parseFloat(company.properties.annualrevenue) : undefined,
        city: company.properties.city,
        state: company.properties.state,
        country: company.properties.country,
        createdate: company.properties.createdate
      }));
    } catch (error: any) {
      console.error('Error fetching HubSpot companies:', error.message);
      throw error;
    }
  }

  async getDeals(limit: number = 100): Promise<HubSpotDeal[]> {
    try {
      const client = await getUncachableHubSpotClient();
      const response = await client.crm.deals.basicApi.getPage(
        limit,
        undefined,
        ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'createdate', 'hs_lastmodifieddate']
      );
      
      return response.results.map((deal: any) => ({
        id: deal.id,
        dealname: deal.properties.dealname || '',
        amount: deal.properties.amount ? parseFloat(deal.properties.amount) : undefined,
        dealstage: deal.properties.dealstage || '',
        pipeline: deal.properties.pipeline,
        closedate: deal.properties.closedate,
        createdate: deal.properties.createdate,
        hs_lastmodifieddate: deal.properties.hs_lastmodifieddate
      }));
    } catch (error: any) {
      console.error('Error fetching HubSpot deals:', error.message);
      throw error;
    }
  }

  async getDashboardStats(): Promise<{
    totalContacts: number;
    totalCompanies: number;
    totalDeals: number;
    openDeals: number;
    closedWonDeals: number;
    totalDealValue: number;
    recentContacts: HubSpotContact[];
    recentDeals: HubSpotDeal[];
    dealsByStage: Record<string, number>;
  }> {
    try {
      const [contacts, companies, deals] = await Promise.all([
        this.getContacts(100),
        this.getCompanies(100),
        this.getDeals(100)
      ]);

      const dealsByStage: Record<string, number> = {};
      let totalDealValue = 0;
      let closedWonDeals = 0;

      deals.forEach(deal => {
        dealsByStage[deal.dealstage] = (dealsByStage[deal.dealstage] || 0) + 1;
        if (deal.amount) {
          totalDealValue += deal.amount;
        }
        if (deal.dealstage === 'closedwon') {
          closedWonDeals++;
        }
      });

      const openDeals = deals.filter(d => !['closedwon', 'closedlost'].includes(d.dealstage)).length;

      return {
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        totalDeals: deals.length,
        openDeals,
        closedWonDeals,
        totalDealValue,
        recentContacts: contacts.slice(0, 10),
        recentDeals: deals.slice(0, 10),
        dealsByStage
      };
    } catch (error: any) {
      console.error('Error fetching HubSpot dashboard stats:', error.message);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await getAccessToken();
      return true;
    } catch {
      return false;
    }
  }
}

export const hubspotService = new HubSpotService();
