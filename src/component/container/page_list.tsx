import Dropdown from '../../lsg/patterns/dropdown';
import { DropdownItemEditableLink } from '../../lsg/patterns/dropdown-item';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/project/page-ref';
import { Project } from '../../store/project/project';
import * as React from 'react';
import { Store } from '../../store/store';

export interface PageListProps {
	store: Store;
}

export interface PageListItemProps {
	pageID: string;
	name: string;
	pageRef: PageRef;
	projectPages: PageRef[];
	store: Store;
}

@observer
export class PageListItem extends React.Component<PageListItemProps> {
	@MobX.observable protected pageElementEditable: boolean = false;
	@MobX.observable protected pageNameError: boolean = false;
	@MobX.observable
	protected pageNameInputValue: string = this.pageNameInputValue || this.props.name;

	public constructor(props: PageListItemProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handlePageKeyDown = this.handlePageKeyDown.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
		this.handlePageDoubleClick = this.handlePageDoubleClick.bind(this);
		this.renamePage = this.renamePage.bind(this);
	}
	public render(): JSX.Element {
		return (
			<DropdownItemEditableLink
				editable={this.pageElementEditable}
				error={this.pageNameError}
				focused={this.pageElementEditable}
				handleBlur={this.handleBlur}
				handleChange={this.handleInputChange}
				handleClick={this.handlePageClick}
				handleDoubleClick={this.handlePageDoubleClick}
				handleKeyDown={this.handlePageKeyDown}
				name={this.props.name}
				value={this.pageNameInputValue}
			/>
		);
	}

	protected handlePageClick(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		this.props.store.openPage(this.props.pageID);
	}

	@MobX.action
	protected handleBlur(): void {
		this.pageElementEditable = false;
		this.pageNameInputValue = this.props.name;
	}

	@MobX.action
	protected handlePageDoubleClick(): void {
		this.pageElementEditable = !this.pageElementEditable;
	}

	@MobX.action
	protected handlePageKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		switch (e.key.toString()) {
			case 'Escape':
				this.pageNameInputValue = this.props.name;
				this.pageElementEditable = false;
				break;

			case 'Enter':
				if (!this.pageNameInputValue) {
					this.pageNameInputValue = this.props.name;
					this.pageElementEditable = false;
					return;
				}

				const pageOfSameName = this.props.projectPages.find(
					(page: PageRef) => page.getName() === this.pageNameInputValue
				);

				if (!pageOfSameName) {
					this.renamePage(this.pageNameInputValue);
					this.pageElementEditable = false;
					this.pageNameError = false;
				} else {
					this.pageNameError = true;
					console.log(this.pageNameError);
				}
				break;

			default:
				return;
		}
	}

	protected handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.pageNameInputValue = e.target.value;
	}

	protected renamePage(name: string): void {
		const currentPage = this.props.store.getCurrentPage();

		this.props.pageRef.setName(name);
		this.props.pageRef.setId(Store.convertToId(name));

		if (currentPage) {
			currentPage.setName(name);
			this.props.store.renamePage(Store.convertToId(name));
			currentPage.setId(Store.convertToId(name));
		}
	}
}

@observer
export class PageList extends React.Component<PageListProps> {
	@MobX.observable protected pageListVisible: boolean = false;
	public constructor(props: PageListProps) {
		super(props);

		this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
	}

	public render(): JSX.Element {
		const currentPage = this.props.store.getCurrentPage();
		let currentPageName = '';
		if (currentPage) {
			currentPageName = currentPage.getName();
		}
		return (
			<Dropdown
				label={currentPageName}
				handleClick={this.handleDropdownToggle}
				open={this.pageListVisible}
			>
				{this.getProjectPages().map((page: PageRef, index) => (
					<PageListItem
						key={index}
						name={page.getName()}
						pageID={page.getId()}
						pageRef={page}
						projectPages={this.getProjectPages()}
						store={this.props.store}
					/>
				))}
			</Dropdown>
		);
	}

	public getProjectPages(): PageRef[] {
		const project: Project | undefined = this.props.store.getCurrentProject();
		let projectPages: PageRef[] = [];
		if (project) {
			projectPages = project.getPages();
		}
		return projectPages;
	}

	@MobX.action
	protected handleDropdownToggle(): void {
		this.pageListVisible = !this.pageListVisible;
	}
}
