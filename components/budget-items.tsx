"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, DollarSign } from 'lucide-react'

export interface BudgetItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface BudgetItemsProps {
  items: BudgetItem[]
  onChange: (items: BudgetItem[]) => void
}

const UNITS = [
  'hour', 'day', 'week', 'month', 'year',
  'piece', 'unit', 'kg', 'lb', 'meter', 'foot',
  'liter', 'gallon', 'service', 'license', 'other'
]

export default function BudgetItems({ items, onChange }: BudgetItemsProps) {
  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit: 'piece',
      unitPrice: 0,
      total: 0
    }
    onChange([...items, newItem])
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalcular el total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
        }
        
        return updatedItem
      }
      return item
    })
    onChange(updatedItems)
  }

  const getTotalBudget = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-slate-200">Budget Items</Label>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-black/30 rounded-lg border border-dashed border-slate-600">
          <DollarSign className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No budget items added yet</p>
          <p className="text-slate-500 text-sm">Click "Add Item" to start building your budget</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-black/50 rounded-lg border border-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Description */}
                <div className="md:col-span-4">
                  <Label htmlFor={`desc-${item.id}`} className="text-sm text-slate-300 mb-1 block">
                    Description
                  </Label>
                  <Input
                    id={`desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <Label htmlFor={`qty-${item.id}`} className="text-sm text-slate-300 mb-1 block">
                    Quantity
                  </Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                  />
                </div>

                {/* Unit */}
                <div className="md:col-span-2">
                  <Label htmlFor={`unit-${item.id}`} className="text-sm text-slate-300 mb-1 block">
                    Unit
                  </Label>
                  <Select
                    value={item.unit}
                    onValueChange={(value) => updateItem(item.id, 'unit', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-slate-600">
                      {UNITS.map(unit => (
                        <SelectItem key={unit} value={unit} className="text-slate-200 hover:bg-slate-700">
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <Label htmlFor={`price-${item.id}`} className="text-sm text-slate-300 mb-1 block">
                    Unit Price ($)
                  </Label>
                  <Input
                    id={`price-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                  />
                </div>

                {/* Total */}
                <div className="md:col-span-1">
                  <Label className="text-sm text-slate-300 mb-1 block">
                    Total
                  </Label>
                  <div className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 font-medium text-center">
                    ${item.total.toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Total Budget */}
          <div className="flex justify-end">
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
              <div className="text-center">
                <Label className="text-sm text-slate-300 mb-2 block">Total Budget</Label>
                <div className="text-2xl font-bold text-purple-300">
                  ${getTotalBudget().toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
