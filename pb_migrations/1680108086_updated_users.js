migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k0v5i4fxnkw1bxj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "axtfyuxl",
    "name": "scale2",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k0v5i4fxnkw1bxj")

  // remove
  collection.schema.removeField("axtfyuxl")

  return dao.saveCollection(collection)
})
