import { Router } from 'express';
import BudgetItem from '../models/BudgetItem.js';
const budgetRouter = Router();

// Create a new Budget item
budgetRouter.post('/', async (req, res) => {
  const { itemName, estimateAmount, paidAmount, dueAmount, totalCost, budgetPercent, eventId } = req.body;

  try {
    const newBudgetItem = new BudgetItem({
      itemName,
      estimateAmount,
      paidAmount,
      dueAmount,
      totalCost,
      budgetPercent,
      eventId,
    });

    await newBudgetItem.save();
    res.status(201).json(newBudgetItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch budget list by event id
budgetRouter.get('/', async (req, res) => {
    const { eventId } = req.query;
    try {
        const budgetList = eventId 
            ? await BudgetItem.find({ eventId }) // Find budget list by eventId
            : []; // Otherwise, return empty array
        res.json(budgetList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
});

// Update a Budget item
budgetRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { itemName, estimateAmount, paidAmount, dueAmount, totalCost, budgetPercent } = req.body;

  try {
      const updatedBudgetItem = await BudgetItem.findByIdAndUpdate(
          id,
          {
              itemName,
              estimateAmount,
              paidAmount,
              dueAmount,
              totalCost,
              budgetPercent,
          },
          { new: true } // Return the updated document
      );

      if (!updatedBudgetItem) {
          return res.status(404).json({ message: 'Budget item not found' });
      }

      res.json(updatedBudgetItem);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});



export default budgetRouter;