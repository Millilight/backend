describe('update wishes', () => {
  it('should update the wishes', () => {
    return resolver
      .updateWishes(
        {
          _id: '624af86f5998c2fdfa851b16',
          firstname: 'Test',
          lastname: 'Test',
          email: 'test@test.fr',
          wishes: {},
        },
        {
          burial_cremation: 'TEST1',
          burial_cremation_place: 'TEST2',
          music: 'TEST3',
        }
      )
      .then((data) => {
        expect(data.burial_cremation).toEqual('TEST1');
        expect(data.burial_cremation_place).toEqual('TEST2');
        expect(data.music).toEqual('TEST3');
      });
  });
});
