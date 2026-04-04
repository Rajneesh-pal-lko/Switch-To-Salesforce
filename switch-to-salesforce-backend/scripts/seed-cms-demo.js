/**
 * Demo sidebar groups, topics, and a sample CMS page (requires MongoDB).
 * Usage: from backend folder, `node scripts/seed-cms-demo.js`
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const SidebarGroup = require('../models/SidebarGroup');
const SidebarTopic = require('../models/SidebarTopic');
const PageContent = require('../models/PageContent');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);

  const g = await SidebarGroup.findOneAndUpdate(
    { name: 'Tutorials' },
    { name: 'Tutorials', order: 0 },
    { upsert: true, new: true }
  );

  const topic = await SidebarTopic.findOneAndUpdate(
    { slug: 'apex-development' },
    {
      name: 'Apex Development',
      slug: 'apex-development',
      groupId: g._id,
      order: 0,
    },
    { upsert: true, new: true }
  );

  await PageContent.findOneAndUpdate(
    { slug: 'apex-development' },
    {
      title: 'Apex Development',
      slug: 'apex-development',
      topicId: topic._id,
      author: 'Switch To Salesforce',
      content:
        "<p>This is a sample CMS page. Edit it from the <strong>admin</strong> under Pages.</p><pre><code class=\"language-java\">System.debug('Hello');</code></pre>",
    },
    { upsert: true, new: true }
  );

  console.log('CMS demo: group “Tutorials”, topic “apex-development”, page slug apex-development');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
