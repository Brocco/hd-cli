const proxyProc = require('child_process');
const path = require('path');
import { Args, Command, Flags, ux } from '@oclif/core';
import * as inquirer from 'inquirer';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client/core';

interface Product {
  name: string;
  versions: string[];
}

interface Entry {
  ordinal: number;
  accessible: boolean;
  packageVersion: {
    name: string;
    version: string;
    fqns: string;
    origination: {
      name: string;
      type: string;
      version: string;
    };
  };
}

interface ReleaseTrain {
  id: number;
  key: string;
  name: string;
  products: [
    {
      id: number;
      key: string;
      name: string;
    }
  ];
  entries: Entry[];
}

export class NesInit extends Command {
  static description = 'Initialize a project to use NES packages';

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    ux.prompt;

    // const accessToken = await ux.prompt('Enter access token', { type: 'hide' });
    const accessToken = '';

    ux.action.start('loading your products');
    const allProducts = await this.getAllProducts(accessToken);
    const productList = await this.getProducts(allProducts);
    ux.action.stop();

    const productResponse = await inquirer.prompt([
      {
        name: 'product',
        message: 'select a product',
        type: 'list',
        choices: productList,
      },
    ]);
    const product: string = productResponse.product;

    this.log(`product: ${JSON.stringify(product, null, 2)}`);
    const versionResponse = await inquirer.prompt([
      {
        name: 'version',
        message: 'select a version',
        type: 'list',
        choices: this.getProductVersions(allProducts, product),
      },
    ]);
    const version: string = versionResponse.version;

    const fullPackageList = this.getPackages(allProducts, product, version).map((p) => ({
      ...p,
      checked: true,
    }));
    const packageResponse = await inquirer.prompt([
      {
        name: 'packages',
        message: `select the packages`,
        type: 'checkbox',
        pageSize: fullPackageList.length,
        choices: fullPackageList,
      },
    ]);
    const packages = packageResponse.packages;

    ux.action.start('configuring your project');
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
    // this.log('\n\n\n');
    // this.log('CONFIGURING FOR:');
    // packages.forEach((p) => {
    //   this.log(`  ${version}-${p}`);
    // });
    ux.action.stop();
    this.log('Your project is now configured to access your NES product');
  }

  private getAllProductsTest(accessToken: string): Promise<Product[]> {
    const fakeProductList: Product[] = [
      {
        name: 'Vue 2.6',
        versions: ['2.6.6', '2.6.7', '2.6.8'],
      },
      {
        name: 'Angular 6',
        versions: [
          '6.1.11-upgrade',
          '6.1.11-service-worker',
          '6.1.11-router',
          '6.1.11-platform-webworker',
          '6.1.11-platform-webworker-dynamic',
          '6.1.11-platform-server',
          '6.1.11-platform-browser',
          '6.1.11-platform-browser-dynamic',
          '6.1.11-http',
          '6.1.11-forms',
          '6.1.11-core',
          '6.1.11-compiler',
          '6.1.11-compiler-cli',
          '6.1.11-common',
          '6.1.11-animations',
          '6.2.22-upgrade',
          '6.2.22-service-worker',
          '6.2.22-router',
          '6.2.22-platform-webworker',
          '6.2.22-platform-webworker-dynamic',
          '6.2.22-platform-server',
          '6.2.22-platform-browser',
          '6.2.22-platform-browser-dynamic',
          '6.2.22-http',
          '6.2.22-forms',
          '6.2.22-core',
          '6.2.22-compiler',
          '6.2.22-compiler-cli',
          '6.2.22-common',
          '6.2.22-animations',
        ],
      },
      {
        name: 'Angular 8',
        versions: ['8.8.8-core', '8.8.8-common'],
      },
    ];
    return new Promise((resolve) => {
      setTimeout(() => {
        // resolve(token.split('').map((p) => ({ name: p })));
        resolve(fakeProductList);
      }, 1000);
    });
  }

  async getAllProducts(accessToken: string): Promise<any[]> {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      uri: 'https://api.nes.herodevs.com/graphql',
    });

    const queryResult = await client.query({
      query: gql`
        query SearchPackagesByToken($input: LicensingSearchPackageByTokenInput!) {
          licensing {
            searchPackagesByToken(input: $input) {
              results {
                fqns
                name
                versions {
                  id
                  key
                  name
                  version
                }
              }
            }
          }
        }
      `,
      variables: { input: { tenantId: 1000, token: accessToken } },
    });

    const results = queryResult.data?.licensing?.releaseTrains?.results;
    if (!results) {
      throw new Error('your mom');
    }

    this.log(`gql results: \n${JSON.stringify(results[0], null, 2)}`);

    return results;
  }

  private getProducts(products: Product[]): { name: string }[] {
    return products.map((p) => ({ name: p.name })).sort(this.sortByName);
  }

  private getProductVersions(products: Product[], productName: string): { name: string }[] {
    const product = products.find((p) => p.name === productName);
    const versionNumbers = product.versions.map((v) => this.parseVersionNumber(v).version);

    // Remove duplicate version numbers
    return [...new Set(versionNumbers)].map((v) => ({ name: v })).sort(this.sortByName);
  }

  private getPackages(
    products: Product[],
    productName: string,
    version: string
  ): { name: string }[] {
    const product = products.find((p) => p.name === productName);
    const packages = product.versions
      .map(this.parseVersionNumber)
      .filter((p) => p.version === version)
      .map((p) => ({ name: p.package }))
      .sort(this.sortByName);
    return packages;
  }

  private parseVersionNumber(fullVersion: string): { version: string; package: string } {
    const i = fullVersion.indexOf('-');

    return {
      package: fullVersion.slice(i + 1),
      version: fullVersion.slice(0, i),
    };
  }

  private sortByName<T extends { name: string }>(a: T, b: T): number {
    return a.name === b.name ? 0 : a.name > b.name ? 1 : -1;
  }
}
/**

what is your access token?
....
what product are you initializing?
a
b
c
...
what version are you initializing?
a
b
c
...
what packages would you like to setup?
a
b
c
...
initializing...


*/
