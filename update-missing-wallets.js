#!/usr/bin/env bun

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { generateEthereumWallet } from "./src/utils/web2";

// Load environment variables from .env file
config();

// Configuration object
const appConfig = {
  services: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SRK: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
};

async function updateMissingWallets() {
  console.log("Starting wallet update script...");
  
  try {
    // Create Supabase client with Service Role Key for admin access
    const supabaseUrl = appConfig.services.supabase.url;
    const supabaseSRK = appConfig.services.supabase.SRK;
    
    if (!supabaseUrl || !supabaseSRK) {
      console.error("Missing Supabase URL or Service Role Key in configuration");
      console.error("Make sure your .env file contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
      return;
    }
    
    console.log("Creating Supabase client with admin privileges...");
    console.log(`Using Supabase URL: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseSRK);
  
    // Get all profiles without wallets
    const { data: profilesWithoutWallet, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .is("wallet", null);
    
    if (fetchError) {
      console.error("Error fetching profiles without wallets:", fetchError);
      return;
    }
    
    console.log(`Found ${profilesWithoutWallet?.length || 0} profiles without wallets`);
    
    // Update each profile with a new wallet
    let successCount = 0;
    let errorCount = 0;
    
    for (const profile of profilesWithoutWallet || []) {
      try {
        // Generate a new wallet
        const wallet = generateEthereumWallet();
        console.log(`Generating wallet for user ${profile.id}: ${wallet.address}`);
        
        // Update the profile with the new wallet
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ wallet })
          .eq("id", profile.id)
          .single();
        
        if (updateError) {
          console.error(`Error updating wallet for user ${profile.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Successfully updated wallet for user ${profile.id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Exception while updating wallet for user ${profile.id}:`, error);
        errorCount++;
      }
    }
    
    console.log("\nWallet Update Summary:");
    console.log(`Total profiles processed: ${profilesWithoutWallet?.length || 0}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed to update: ${errorCount}`);
  } catch (error) {
    console.error("Unexpected error in script:", error);
  }
}

// Run the function
updateMissingWallets()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed with error:", error);
    process.exit(1);
  });
