/**
 * Centralized Warehouse Configuration
 * This file contains the list of all warehouses, their database paths, and metadata.
 */

const warehouses = {
    'newgudang': {
        name: 'Gudang Waru',
        dbPath: '/root/newgudang/database/waru.db',
        url: 'https://gudangwaru.my.id'
    },
    'gudangkletek': {
        name: 'Gudang Kletek',
        dbPath: '/root/gudangkletek/database/kletek.db',
        url: 'https://gudangkletek.my.id'
    },
    'gudangrm1': {
        name: 'RM Abba',
        dbPath: '/root/gudangrm1/database/gudangrawmaterialabba.db',
        url: 'https://gudangrmabba.my.id'
    },
    'gudangrm2': {
        name: 'RM Cassaland',
        dbPath: '/root/gudangrm2/database/gudangrawmaterialcassaland.db',
        url: 'https://gudangcassaland.my.id'
    },
    'gudangrm3': {
        name: 'RM Sumber Asia',
        dbPath: '/root/gudangrm3/database/gudangrawmaterialsumberasia.db',
        url: 'https://gudangsumberasia.my.id'
    },
    'gudangrm4': {
        name: 'RM Kemasan',
        dbPath: '/root/gudangrm4/database/gudangrawmaterialkemasan.db',
        url: 'https://gudangkemasan.my.id'
    }
};

module.exports = warehouses;
