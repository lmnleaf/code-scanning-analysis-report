class Moctokit {
  constructor(mockData = [], error = false, errorMessage = 'fetch error') {
    this.rest = {
      codeScanning: {
        listRecentAnalyses: this.listRecentAnalyses
      },
      repos: {
        listForOrg: this.listForOrg
      }
    };
    this.paginate = this.mockPaginate;
    this.mockData = mockData;
    this.error = error;
    this.errorMessage = errorMessage;
  }

  mockPaginate = jasmine.createSpy('paginate').and.callFake((method, options, callback) => {
    const error = this.error;
    const errorMessage = this.errorMessage;
    const mockData = this.mockData;
    const response = { data: mockData };
    const done = jasmine.createSpy('done');

    if(error) {
      return Promise.reject(new Error(errorMessage));
    } else {
      callback(response, done);
      return Promise.resolve(mockData);
    }
  });
}
  
export default Moctokit;
