import mongoose, { Schema } from 'mongoose';

export interface IWishlistItem {
    name: string;
    description?: string;
    price: number;
    priority: 'low' | 'medium' | 'high';
    url?: string;
}

const wishlistSchema = new Schema<IWishlistItem>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            minlength: [1, 'Name must be at least 1 character long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
            trim: true
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0.01, 'Price must be greater than 0']
        },
        priority: {
            type: String,
            required: [true, 'Priority is required'],
            enum: {
                values: ['low', 'medium', 'high'],
                message: '{VALUE} is not a valid priority'
            },
            default: 'medium'
        },
        url: {
            type: String,
            validate: {
                validator: function (v: string) {
                    if (!v) return true;
                    try {
                        new URL(v);
                        return true;
                    } catch (e) {
                        return false;
                    }
                },
                message: (props: any) => `${props.value} is not a valid URL!`
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

wishlistSchema.virtual('isExpensive').get(function (this: any) {
    return this.price > 100;
});

export const WishlistItem = mongoose.model<IWishlistItem>('WishlistItem', wishlistSchema);
