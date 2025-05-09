import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  deleteAccount(arg0: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto) {
    const setting = this.settingRepository.create(createSettingDto);
    return await this.settingRepository.save(setting);
  }

  async findAll() {
    return await this.settingRepository.find();
  }

  async findOne(id: number) {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }
    return setting;
  }

  async findByDonorId(donorId: number) {
    const setting = await this.settingRepository.findOne({ where: { donorId } });
    if (!setting) {
      // If no settings exist yet for this donor, create default settings
      const defaultSettings = this.settingRepository.create({
        donorId,
        notificationEnabled: true,
        emailFrequency: 'weekly',
        privacyLevel: 'private',
        theme: 'light',
        language: 'en'
      });
      return await this.settingRepository.save(defaultSettings);
    }
    return setting;
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    await this.settingRepository.update(id, updateSettingDto);
    return this.findOne(id);
  }

  async updateByDonorId(donorId: number, updateSettingDto: UpdateSettingDto) {
    let setting = await this.settingRepository.findOne({ where: { donorId } });
    
    if (!setting) {
      // If no settings exist yet for this donor, create them with the update data
      const newSettings = this.settingRepository.create({
        donorId,
        ...updateSettingDto
      });
      return await this.settingRepository.save(newSettings);
    }
    
    // Update existing settings
    await this.settingRepository.update({ donorId }, updateSettingDto);
    return await this.settingRepository.findOne({ where: { donorId } });
  }

  async remove(id: number) {
    const setting = await this.findOne(id);
    return await this.settingRepository.remove(setting);
  }
}