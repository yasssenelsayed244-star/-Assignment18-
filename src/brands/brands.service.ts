import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private brandsRepository: Repository<Brand>,
    ) { }

    create(createBrandDto: CreateBrandDto) {
        const brand = this.brandsRepository.create(createBrandDto);
        return this.brandsRepository.save(brand);
    }

    findAll() {
        return this.brandsRepository.find();
    }

    async findOne(id: number) {
        const brand = await this.brandsRepository.findOne({ where: { id } });
        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }
        return brand;
    }

    async update(id: number, updateBrandDto: UpdateBrandDto) {
        const brand = await this.findOne(id);
        this.brandsRepository.merge(brand, updateBrandDto);
        return this.brandsRepository.save(brand);
    }

    async remove(id: number) {
        const brand = await this.findOne(id);
        return this.brandsRepository.remove(brand);
    }
}
