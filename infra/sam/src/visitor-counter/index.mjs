import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb"

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

const getTotal = async () => {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { counterId: COUNTER_ID } })
  )
  return result.Item?.visits ?? 0
}

const incrementTotal = async () => {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { counterId: COUNTER_ID },
      UpdateExpression: "SET visits = if_not_exists(visits, :zero) + :inc",
      ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
      ReturnValues: "UPDATED_NEW",
    })
  )
  return result.Attributes.visits
}

const parseVisitorId = (event) => {
  if (!event.body) return undefined
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf-8")
      : event.body
    const { visitorId } = JSON.parse(raw)
    // Cap length defensively — this is client-supplied input.
    return typeof visitorId === "string" && visitorId.length > 0
      ? visitorId.slice(0, 100)
      : undefined
  } catch {
    return undefined
  }
}

export const handler = async (event) => {
  try {
    const visitorId = parseVisitorId(event)

    // No visitor id (old client, storage blocked, etc.) — fall back to
    // always incrementing, same as before.
    if (!visitorId) {
      return jsonResponse(200, { visits: await incrementTotal() })
    }

    // Record this visitor id exactly once via a conditional write. If it
    // already exists, this is a returning visitor — just report the total
    // without incrementing again.
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            counterId: `visitor#${visitorId}`,
            firstSeen: new Date().toISOString(),
          },
          ConditionExpression: "attribute_not_exists(counterId)",
        })
      )
      return jsonResponse(200, { visits: await incrementTotal() })
    } catch (error) {
      if (error.name === "ConditionalCheckFailedException") {
        return jsonResponse(200, { visits: await getTotal() })
      }
      throw error
    }
  } catch (error) {
    console.error("Failed to update visitor count", error)
    return jsonResponse(500, { message: "Failed to update visitor count" })
  }
}
