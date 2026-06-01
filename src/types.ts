/** A person's contact details. */
export type Profile = {
  name: string;
  phone: string;
  email: string;
};

/** A contact saved after scanning someone else's QR code. */
export type Contact = Profile & {
  /** Stable local id. */
  id: string;
  /** Epoch ms of when it was scanned. */
  scannedAt: number;
};
