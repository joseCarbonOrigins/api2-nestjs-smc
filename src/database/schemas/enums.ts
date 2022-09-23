export const enum Status {
  active = 'active',
  inactive = 'inactive',
  busy = 'busy',
}

export const enum Mission_State {
  waiting_order = 'waiting_order',
  driving_merchant = 'driving_merchant',
  waiting_merchant = 'waiting_merchant',
  driving_delivery = 'driving_delivery',
  waiting_delivery = 'waiting_delivery',
  driving_home = 'driving_home',
  driving_fix = 'driving_fix',
  Driving_to_merchant = 'Driving to merchant',
  Driving_to_customer = 'Driving to customer',
  Driving_Home = 'Driving Home',
}

export const enum Order_Satus {
  new = 'new',
  confirmed = 'confirmed',
  placing = 'placing',
  placed = 'placed',
  arrived = 'arrived',
  enroute = 'enroute',
  delivered = 'delivered',
}

export const enum Skipster_Type {
  shift = 'shift',
  gig = 'gig',
}

export const enum Skippy_Type {
  skippy = 'skippy',
  segway = 'segway',
}
