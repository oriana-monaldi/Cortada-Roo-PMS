export type VacationPeriod = {
  id: string;
  startDate: Date;
  endDate: Date;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateVacationPeriodInput = {
  startDate: Date;
  endDate: Date;
  note?: string;
};
