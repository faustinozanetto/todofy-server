import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Todo } from '../entities'

@ObjectType()
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ nullable: false, unique: true })
  username!: string;

  @Field()
  @Column({ nullable: false, unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Todo, (todo) => todo.creator)
  todos: Todo[];

  @Column('int', { default: 0 })
  tokenVersion: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
