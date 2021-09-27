import { BaseError } from "../fault";

export default class FirebaseFirestoreError extends BaseError {
  constructor(fault: { message: string; origin?: unknown }) {
    super({ type: "firebase/firestore", ...fault });
  }
}
