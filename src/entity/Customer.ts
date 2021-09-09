import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm"

@Entity()
@Index(['name', 'streetName', 'city', 'stateOrProvince', 'email', 'phoneNumber'], { fulltext: true})
export class Customer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  streetName: string

  @Column()
  houseNumber: number

  @Column()
  city: string

  @Column()
  stateOrProvince: string

  @Column({
    unique: true,
    nullable: false
  })
  email: string

  @Column({
    unique: true,
    nullable: false
  })
  phoneNumber: string

  @CreateDateColumn({
    select: false
  })
  createdAt: Date

  @UpdateDateColumn({
    select: false
  })
  updatedAt: Date

  @DeleteDateColumn({
    select: false
  })
  deletedAt: Date
}
