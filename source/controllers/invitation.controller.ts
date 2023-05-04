import { Request, Response } from "express";
import { Customer } from "../models/customers.model";
import { Coordinates } from "../models/coordinates.model";
import * as multer from 'multer';
import MQPublisher from "../publisher/invitationSender";

const EARTH_RADIUS_IN_KM = 6371;

class InvitesController {
  private readonly publisher: MQPublisher;
  private rabbitMQURL: string;
  private queueName: string;

  constructor(rabbitMQURL: string, queueName: string) {
    this.publisher = new MQPublisher(rabbitMQURL, queueName);
    this.queueName = queueName;
    this.rabbitMQURL = rabbitMQURL;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private greatCircleDistanceInKm(pointA: Customer, pointB: Coordinates): number {
    const latA = this.toRadians(pointA.lat);
    const longA = this.toRadians(pointA.long);
    const latB = this.toRadians(pointB.lat);
    const longB = this.toRadians(pointB.long);

    const deltaLong = longB - longA;

    const centralAngle = Math.acos(
      Math.sin(latA) * Math.sin(latB) +
      Math.cos(latA) * Math.cos(latB) * Math.cos(deltaLong),
    );

    return EARTH_RADIUS_IN_KM * centralAngle;
  }

  private filterCustomersWithinRadius(customers: Customer[], radiusInKm: number, fintechCoordinates: Coordinates): Customer[] {
    return customers.filter(
      (customer) => this.greatCircleDistanceInKm(customer, fintechCoordinates) <= radiusInKm,
    );
  }

  private sortCustomersById(customers: Customer[]): Customer[] {
    return customers.sort((a, b) => a.id.localeCompare(b.id));
  }

  public computeInvites = async (req: Request, res: Response): Promise<void> => {
    // Set up multer middleware to handle file uploads
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

          /** We can decide to split the id, long and lat automatically by destructuring. 
          However, we need to consider that they may not always be in order.
          **/
          // const [id, lat, long] = line.split(',');

          // Extract the values for ID, latitude and long regardless of position
          const id = line.split("id: ")[1].split(",")[0];
          const lat = line.split("lat:")[1].split(",")[0];
          const long = line.split("long:")[1].split(",")[0];
          const customerLocation: Customer = { id: id, lat: parseFloat(lat), long: parseFloat(long) };

          // Handle various errors like null latitude values, and short customer id's
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

        //compute the great circle distance using the greatcircle function for all customers
        const customersWithinRadius = this.filterCustomersWithinRadius(customersLocations, 100, fintechCoordinates,);
        const sortedCustomers = this.sortCustomersById(customersWithinRadius);
        const customerIds = sortedCustomers.map((customer) => customer.id);
        this.sendCustomerIdsToMessageBroker(customerIds);
        res.json({ sortedCustomers });
      }
    });
  };

  private async sendCustomerIdsToMessageBroker(customerIds: string[]) {
    // const publisher = new MQPublisher(this.rabbitMQURL, this.queueName);
    try {
      await this.publisher.start();
      customerIds.map(async (customerId) => {
        await this.publisher.publish(JSON.stringify(customerId));
      });
      await this.publisher.stop();
    } catch (error) {
      console.log(error);
    }

  }
};

export default InvitesController;