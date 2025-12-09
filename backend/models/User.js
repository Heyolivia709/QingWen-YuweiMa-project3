import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  completedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }]
});

export default mongoose.model('User', UserSchema);

