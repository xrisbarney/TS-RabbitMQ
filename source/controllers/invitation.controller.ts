import { Request, Response } from "express";
import { Customer } from "../models/customers.model";
import { Coordinates } from "../models/coordinates.model";
import * as multer from 'multer';
import createMQProducer from "../publisher/invitationSender";


export const computeInvites = async (req: Request, res: Response): Promise<void> => {


  // // Set up multer middleware to handle file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  // Handle file upload using the upload.single() middleware function
  upload.single('file')(req, res, (err: any) => {
    // retrieve the fintech coordinates
    const fintechCoordinatesLong: number = parseFloat(req.body.fintechCoordinatesLong);
    const fintechCoordinatesLat: number = parseFloat(req.body.fintechCoordinatesLat);
    const fintechCoordinates: Coordinates = { lat: fintechCoordinatesLat, long: fintechCoordinatesLong }

    if (err instanceof multer.MulterError) {
      res.status(400).json({ status: "error", message: 'Error uploading file' });
    } else if (err) {
      res.status(500).json({ status: "error", message: 'Server error' });
    } else if (!req.file) {
      res.status(400).json({ status: "error", message: 'No file uploaded' });
    } else {
      const lines = req.file.buffer.toString().split('\n');

      const customersLocations: Customer[] = lines.map((line) => {

        // const [id, lat, long] = line.split(',');

        // Extract the values for ID, latitude and long
        const id = line.split("id: ")[1].split(",")[0];
        const lat = line.split("lat:")[1].split(",")[0];
        const long = line.split("long:")[1].split(",")[0];
        const customerLocation: Customer = { id: id, lat: parseFloat(lat), long: parseFloat(long) };



        // console.log(distance);
        if (!customerLocation.lat) {
          console.log("Invalid latitude");
        }
        if (!customerLocation.long) {
          console.log("Invalid longtitude");
        }
        if (customerLocation.id.length != 36) {
          console.log("Invalid customer id");
        }
        return { id, lat: parseFloat(lat), long: parseFloat(long) };
      });
      //compute the great circle distance using the greatcircle function
      const customersWithinRadius = filterCustomersWithinRadius(customersLocations, 100, fintechCoordinates,);
      const sortedCustomers = sortCustomersById(customersWithinRadius);
      const customerIds = sortedCustomers.map((customer) => customer.id);
      sendCustomerIdsToMessageBroker(customerIds);
      res.json({ sortedCustomers });
    }
  });
};

// Great circle computation reference https://github.com/thealmarques/haversine-distance-typescript/blob/master/index.ts
const EARTH_RADIUS_IN_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function greatCircleDistanceInKm(pointA: Customer, pointB: Coordinates): number {
  const latA = toRadians(pointA.lat);
  const longA = toRadians(pointA.long);
  const latB = toRadians(pointB.lat);
  const longB = toRadians(pointB.long);

  const deltaLong = longB - longA;

  const centralAngle = Math.acos(
    Math.sin(latA) * Math.sin(latB) +
    Math.cos(latA) * Math.cos(latB) * Math.cos(deltaLong),
  );

  return EARTH_RADIUS_IN_KM * centralAngle;
}

function filterCustomersWithinRadius(customers: Customer[], radiusInKm: number, fintechCoordinates: Coordinates): Customer[] {
  return customers.filter(
    (customer) => greatCircleDistanceInKm(customer, fintechCoordinates) <= radiusInKm,
  );
}

function sortCustomersById(customers: Customer[]): Customer[] {
  return customers.sort((a, b) => a.id.localeCompare(b.id));
}

async function sendCustomerIdsToMessageBroker(customerIds: string[]) {
  // publish messages to a RabbitMQ
  const rabbitMQURL: string = process.env.RABBITMQ_URL?.toString() || "amqp://username:password@192.168.33.17:5672";
  const eventQueue: string = "customerInvites";
  const producer = await createMQProducer(rabbitMQURL, eventQueue);
  customerIds.map((customerId) => {
    // console.log(customerId);
    producer(JSON.stringify(customerId));
  });
}

// function printCustomerIdsToConsole(customerIds: string[]) {
//   console.log(`Customers within 100km radius of FINTECH CO.: ${customerIds.join(', ')}`);
// }

// sendCustomerIdsToMessageBroker(customerIds);
// printCustomerIdsToConsole(customerIds);