import { Injectable } from "@nestjs/common";


@Injectable()
export class RestaurantService {

    getRestaurantById(id) {
           return {id: id, name:" Pizza Hit"};
    }

    createMenu(createMenuDto) {
        return { message: "Menu created successfully", data: createMenuDto };
    };
 
    createMenuItem(createMenuItemDto) {
        return { message: "Menu item created successfully", data: createMenuItemDto };
    }

    updateRestaurantProfile(updateRestaurantProfileDto) {
        return { message: "Restaurant profile updated successfully", data: updateRestaurantProfileDto };
    }

    disableMenuItem(id) {
        return {message: "Menu item disabled successfully"};
    }

    getOrdersByStatus(status) {
        return {Status: status};
    }

    createVoucher(createVoucherDto) {
        return { message: "Voucher created successfully", data: createVoucherDto };
    }

    deleteVoucher(id) {
        return {message: `Voucher with id ${id} deleted successfully`};
    }
}