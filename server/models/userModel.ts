import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  username: string;
  about: string;
  pushSubscription: any[];
  avatar: { url: string; public_id: string } | null;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: validator.isEmail,
    unique: [true, "Email already exists"],
  },
  about: {
    type: String,
  },
  username: {
    type: String,
    required: [true, "Please enter your username"],
    unique: [true, "Username already exists"],
  },
  password: {
    type: String,
    select: false,
    required: [true, "Please enter your password"],
  },
  avatar: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  pushSubscription: [{ type: Object, select: false }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export type { IUser };

export default User;
