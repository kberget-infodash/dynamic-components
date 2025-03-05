export interface IGraphUser {
  businessPhones: string[];
  displayName: string;
  givenName?: string;
  id: string;
  jobTitle?: string;
  mail?: string;
  mobilePhone?: string | undefined;
  officeLocation?: string | undefined;
  preferredLanguage?: string;
  surname?: string;
  userPrincipalName: string;
}
