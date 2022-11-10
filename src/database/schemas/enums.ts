export enum Status {
  active = 'active',
  inactive = 'inactive',
  busy = 'busy',
}

export enum Mission_State {
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

export enum Order_Satus {
  new = 'new',
  confirmed = 'confirmed',
  placing = 'placing',
  placed = 'placed',
  arrived = 'arrived',
  enroute = 'enroute',
  delivered = 'delivered',
}

export enum Skipster_Type {
  shift = 'shift',
  gig = 'gig',
}

export enum Skippy_Type {
  skippy = 'skippy',
  segway = 'segway',
}

export enum Event_Type {
  mission_picked = 'mission_picked',
  robot_engage = 'robot_engage',
  robot_disengage = 'robot_disengage',
  headset_engage = 'headset_engage',
  headset_disengage = 'headset_disengage',
  room_engage = 'room_engage',
  room_disengage = 'room_disengage',
  camera_reset = 'camera_reset',
}

export enum Platform_Name {
  origins = 'origins',
  smc = 'smc',
}

export enum Enviroment {
  production = 'production',
  testing = 'testing',
}

export function enumValues<T extends Record<string, any>>(e: T): T[keyof T][] {
  return Object.keys(e).map((k) => e[k]);
}
