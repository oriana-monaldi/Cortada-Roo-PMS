export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled";

export type Reservation = {
  id: string;

  apartmentId: string;
  apartmentName: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  guests: number;

  checkIn: Date;
  checkOut: Date;
  nights: number;

  pricePerNight: number;
  totalPrice: number;

  status: ReservationStatus;

  createdAt: Date;
  updatedAt: Date;
};

export type CreateReservationInput = {
  apartmentId: string;
  apartmentName: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  guests: number;

  checkIn: Date;
  checkOut: Date;

  pricePerNight: number;
};
