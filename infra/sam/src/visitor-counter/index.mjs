import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.TABLE_NAME
// Single row holds the running total; a real analytics table could key
// this by date/path instead, but a resume site just needs one counter.
const COUNTER_ID = "site-total"

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

export const handler = async () => {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { counterId: COUNTER_ID },
        UpdateExpression: "SET visits = if_not_exists(visits, :zero) + :inc",
        ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
        ReturnValues: "UPDATED_NEW",
      })
    )

    return jsonResponse(200, { visits: result.Attributes.visits })
  } catch (error) {
    console.error("Failed to update visitor count", error)
    return jsonResponse(500, { message: "Failed to update visitor count" })
  }
}
