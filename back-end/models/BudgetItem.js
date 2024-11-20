import { Schema, model } from 'mongoose';

const BudgetItemSchema = new Schema({
  itemName: { type: String, required: true },
  estimateAmount: { type: Number, required: true, default: 0.0 },
  paidAmount: { type: Number, required: true, default: 0.0 },
  dueAmount: { type: Number, required: true, default: 0.0 },
  totalCost: { type: Number, required: true, default: 0.0 },
  budgetPercent: { type: Number, default: 0.0 },
  eventId: { type: String, required: true }
}, { timestamps: true, default: Date.now });

const BudgetItem = model('BudgetItem', BudgetItemSchema);
export default BudgetItem;