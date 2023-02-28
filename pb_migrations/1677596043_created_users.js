migrate((db) => {
  const collection = new Collection({
    "id": "k0v5i4fxnkw1bxj",
    "created": "2023-02-28 14:54:03.036Z",
    "updated": "2023-02-28 14:54:03.036Z",
    "name": "users",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "oupm5xs3",
        "name": "number",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("k0v5i4fxnkw1bxj");

  return dao.deleteCollection(collection);
})
