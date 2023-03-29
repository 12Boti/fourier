migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k0v5i4fxnkw1bxj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rghm8w63",
    "name": "frequency2",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hozh3jey",
    "name": "phase2",
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
  collection.schema.removeField("rghm8w63")

  // remove
  collection.schema.removeField("hozh3jey")

  return dao.saveCollection(collection)
})
