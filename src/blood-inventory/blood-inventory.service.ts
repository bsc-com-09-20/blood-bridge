import { Injectable } from '@nestjs/common';
import { CreateBloodInventoryDto } from './dto/create-blood-inventory.dto';
import { UpdateBloodInventoryDto } from './dto/update-blood-inventory.dto';
import { BloodInventory } from './entities/blood-inventory.entity';

@Injectable()
export class BloodInventoryService {
  private bloodInventory: BloodInventory[] = [
    {
      id: 1,
      bloodGroup: "A+",
      availableUnits: 10,
      status: "Sufficient"
    },
    {
      id: 2,
      bloodGroup: "O-",
      availableUnits: 1,
      status: "Critical Shortage"
    }
  ];

  create(createBloodInventoryDto: CreateBloodInventoryDto) {
    const newInventory = {
      id: this.bloodInventory.length + 1,
      ...createBloodInventoryDto,
    };
    this.bloodInventory.push(newInventory);
    return newInventory;
  }

  findAll() {
    return this.bloodInventory;
  }

  findOne(id: number) {
    return this.bloodInventory.find(inventory => inventory.id === id);
  }

  update(id: number, updateBloodInventoryDto: UpdateBloodInventoryDto) {
    const index = this.bloodInventory.findIndex(inventory => inventory.id === id);
    if (index !== -1) {
      // Update status based on available units
      const updatedInventory = {
        ...this.bloodInventory[index],
        ...updateBloodInventoryDto,
      };
      
      // Update status if availableUnits is being updated
      if (typeof updateBloodInventoryDto.availableUnits !== 'undefined') {
        updatedInventory.status = updateBloodInventoryDto.availableUnits > 0 
          ? 'Sufficient' 
          : 'Critical Shortage';
      }
      
      this.bloodInventory[index] = updatedInventory;
      return updatedInventory;
    }
    return null;
  }

  remove(id: number) {
    const index = this.bloodInventory.findIndex(inventory => inventory.id === id);
    if (index !== -1) {
      const inventory = this.bloodInventory[index];
      this.bloodInventory.splice(index, 1);
      return inventory;
    }
    return null;
  }
}