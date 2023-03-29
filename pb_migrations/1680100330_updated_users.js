migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k0v5i4fxnkw1bxj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jqxjj7sd",
    "name": "phase",
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
    "id": "8tnsgry0",
    "name": "wavetype",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oupm5xs3",
    "name": "frequency",
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
  collection.schema.removeField("jqxjj7sd")

  // remove
  collection.schema.removeField("8tnsgry0")

  // update
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
})
