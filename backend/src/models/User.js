import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, default: "", trim: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"], required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return true;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
