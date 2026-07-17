export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "expired"
  | "checked-in"
  | "checked-out"
  | "cancelled";

export type Reservation = {
  id: string;

  reservationCode: string;

  apartmentId: string;
  apartmentName: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  estimatedCheckInTime: string;
  observations: string;

  guests: number;

  checkIn: Date;
  checkOut: Date;
  nights: number;

  pricePerNight: number;
  totalPrice: number;

  status: ReservationStatus;

  createdAt: Date;
  updatedAt: Date;

  expiresAt: Date;

  confirmedAt: Date | null;
};

export type CreateReservationInput = {
  apartmentId: string;
  apartmentName: string;

  guestName: string;
  guestEmail: string;
  guestPhone: string;

  estimatedCheckInTime: string;
  observations: string;

  guests: number;

  checkIn: Date;
  checkOut: Date;

  pricePerNight: number;
};
