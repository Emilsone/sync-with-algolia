import { Client, Databases, Query } from 'node-appwrite';
import algoliasearch from 'algoliasearch';
import { getStaticFile, interpolate, throwIfMissing } from './utils.js';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_COLLECTION_ID',
    'ALGOLIA_APP_ID',
    'ALGOLIA_INDEX_ID',
    'ALGOLIA_ADMIN_API_KEY',
    'ALGOLIA_SEARCH_API_KEY',
  ]);

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      ALGOLIA_APP_ID: 'ELDXAY4KDG',
      ALGOLIA_INDEX_ID: 'appwrite_DATA',
      ALGOLIA_SEARCH_API_KEY: 'f925159aa644bc9e261b4636ee21638d',
    });

    return res.send(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const client = new Client()
    .setEndpoint(
     'https://cloud.appwrite.io/v1'
    )
    .setProject('6581afb61991f1b62cce')
    .setKey('5b2c10bf8633781606df0ea2058dfcc640192fa3555cfa658f4adac7e0af0b13a5af3af5f95d07d4fcab14f45cabf28075564f40e89cedf646d3e75599cd15d58ed0673dec2eace026cb3baf6acfcc3f6e840d5e79d38ce0882e121e17fa3b3a719445d2d5ef756fd8f7cbff94c15590000d05a31c917de11691bd716ef0122d');

  const databases = new Databases(client);

  const algolia = algoliasearch(
   'ELDXAY4KDG',
   '60dd1777497cfc4462e78171c43ea96b'
  );
  const index = algolia.initIndex('appwrite_DATA');

  let cursor = null;
  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await databases.listDocuments(
     '6581ab5bed439ba16d65',
     '6581ac04138b5819b934',
      queries
    );

    if (response.documents.length > 0) {
      cursor = response.documents[response.documents.length - 1].$id;
    } else {
      log('No more documents found.');
      cursor = null;
      break;
    }

    log(`Syncing chunk of ${response.documents.length} documents...`);

    const records = response.documents.map(({ $id, ...document }) => ({
      ...document,
      objectID: $id,
    }));

    await index.saveObjects(records);
  } while (cursor !== null);

  log('Sync finished.');

  return res.send('Sync finished.', 200);
};
