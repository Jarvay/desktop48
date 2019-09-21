export default interface ListInterface {
    visible: boolean;

    setVisibility(flag: boolean): void;

    onItemClick(item: any): void | any;
}
