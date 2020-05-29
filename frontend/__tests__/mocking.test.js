function Person(name, foods) {
    this.name = name;
    this.foods = foods;
}

Person.prototype.fetchFavFoods = () => {
    return new Promise((resolve, reject) => {
        //simulate an api
        setTimeout(() => resolve(this.foods), 2000);
    });
};

describe('mock test', () => {
    it('mock a reg function', () => {
       const fetchDogs = jest.fn();
       fetchDogs('snickers');
       expect(fetchDogs).toHaveBeenCalled();
       expect(fetchDogs).toHaveBeenCalledWith('snickers');
       fetchDogs('Hugo');
       expect(fetchDogs).toHaveBeenCalledTimes(2);
    });
    it('can create a person', async() => {
        const me = new Person('Wes', ['pizz', 'burgs']);
        // mock the favFoods function
        me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi', 'ramen']);
        const favFoods = await me.fetchFavFoods();
        // console.log(favFoods);
        expect(favFoods).toContain('sushi');
    });

});