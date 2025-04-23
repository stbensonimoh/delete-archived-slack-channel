const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const archivedChannels = JSON.parse(fs.readFileSync('archived_channels.json', 'utf-8'));
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🔐 Please login manually in the browser window...");
  await page.goto('https://slack.com/signin');
  await page.waitForTimeout(60000); // Wait for Slack login (manual or SSO)

  for (const channel of archivedChannels) {
    console.log(`\n🚀 Opening channel: ${channel.name}`);
    try {
      await page.bringToFront();
      await page.goto(channel.url, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(3000);

      // ✅ Confirm that channel view is rendered
      try {
        await page.waitForSelector('[data-qa="inline_channel_entity__name"]', { timeout: 20000 });
        const displayedName = await page.textContent('[data-qa="inline_channel_entity__name"]');
        console.log(`✅ Channel view loaded: ${displayedName}`);
      } catch (err) {
        console.warn(`⚠️ Channel view failed to load: ${channel.name}`);
        await page.screenshot({ path: `error-${channel.name}-load.png` });
        continue;
      }

      // 🔓 Unarchive if needed
      try {
        const unarchiveBtn = page.locator('button:has-text("Unarchive channel")');
        if (await unarchiveBtn.count() > 0) {
          await unarchiveBtn.first().click();
          console.log(`🔓 Unarchived: ${channel.name}`);
          await page.waitForTimeout(2000);
        }
      } catch (err) {
        console.warn(`⚠️ Unarchive not necessary or failed: ${channel.name}`);
      }

      // ⚙️ Open channel settings
      try {
        const settingsMenuBtn = page.locator('[data-qa="channel_name_button"]');
        await settingsMenuBtn.click();
        await page.waitForTimeout(1000);

        const settingsTab = page.locator('button:has-text("Settings")');
        if (await settingsTab.count() > 0) {
          await settingsTab.click();
          console.log(`⚙️ Opened Settings tab`);
        } else {
          console.warn(`⚠️ Settings tab not found for ${channel.name}`);
          continue;
        }

        await page.waitForTimeout(1000);

        // 🗑️ Click "Delete this channel"
        const deleteBtn = page.locator('button:has-text("Delete this channel")');
        if (await deleteBtn.count() === 0) {
          console.log(`❌ Delete option not available: ${channel.name}`);
          continue;
        }

        await deleteBtn.click();
        await page.waitForTimeout(1000);

        // ✅ Check the checkbox
        const deleteCheckbox = page.locator('label:has-text("Yes, permanently delete the channel") input[type="checkbox"]');
        await deleteCheckbox.check();
        await page.waitForTimeout(500);

        // ✅ Confirm deletion
        const confirmBtn = page.locator('button:has-text("Delete Channel")');
        await confirmBtn.click();

        console.log(`💀 Deleted: ${channel.name}`);
        await page.waitForTimeout(3000);
      } catch (err) {
        console.error(`🛑 Error deleting ${channel.name}:`, err.message);
        await page.screenshot({ path: `error-${channel.name}-delete.png` });
      }

    } catch (err) {
      console.error(`⏰ Timeout or navigation error for ${channel.name}:`, err.message);
      await page.screenshot({ path: `error-${channel.name}-general.png` });
      continue;
    }
  }

  await browser.close();
  console.log("\n🎉 All done deleting archived channels!");
})();