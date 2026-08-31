import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../services/user.service';
import { User, UserRole, CreateUserDTO, UpdateUserDTO } from '../../../../models/user/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUser: User | null = null;
  private usersSubscription?: Subscription;

  searchTerm: string = '';
  roleFilter: string = 'ALL';
  statusFilter: string = 'ALL';

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingUserId: number | null = null;
  userForm: FormGroup;

  isDeleteModalOpen: boolean = false;
  userToDelete: User | null = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Operator', [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();
    this.usersSubscription = this.userService.users$.subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.usersSubscription?.unsubscribe();
  }

  get totalUsersCount(): number {
    return this.users.length;
  }

  get adminCount(): number {
    return this.users.filter(u => u.role === 'Administrator').length;
  }

  get operatorCount(): number {
    return this.users.filter(u => u.role === 'Operator').length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  get isCurrentAdmin(): boolean {
    return this.currentUser?.role === 'Administrator';
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter !== 'ALL') {
      result = result.filter(user => user.role === this.roleFilter);
    }

    if (this.statusFilter !== 'ALL') {
      const isActive = this.statusFilter === 'ACTIVE';
      result = result.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingUserId = null;
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Operator',
      isActive: true
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formVal = this.userForm.value;

    if (this.isEditMode && this.editingUserId !== null) {
      const updateDto: UpdateUserDTO = {
        id: this.editingUserId,
        firstName: formVal.firstName,
        lastName: formVal.lastName,
        email: formVal.email,
        role: formVal.role as UserRole,
        isActive: formVal.isActive
      };

      if (formVal.password && formVal.password.trim()) {
        updateDto.password = formVal.password;
      }

      const updated = this.userService.updateUser(this.editingUserId, updateDto);
      if (updated) {
        this.showToast('Usuario actualizado exitosamente', 'success');
      }
    } else {
      const createDto: CreateUserDTO = {
        firstName: formVal.firstName,
        lastName: formVal.lastName,
        email: formVal.email,
        password: formVal.password,
        role: formVal.role as UserRole,
        isActive: formVal.isActive
      };

      this.userService.createUser(createDto);
      this.showToast('Usuario registrado exitosamente', 'success');
    }

    this.closeModal();
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      if (this.userToDelete.id === this.currentUser?.id) {
        this.showToast('No es posible eliminar el usuario en sesión actual', 'danger');
        this.closeDeleteModal();
        return;
      }
      this.userService.deleteUser(this.userToDelete.id);
      this.showToast('Usuario eliminado correctamente', 'success');
    }
    this.closeDeleteModal();
  }

  toggleStatus(user: User): void {
    this.userService.toggleUserStatus(user.id);
    const stateText = !user.isActive ? 'activado' : 'desactivado';
    this.showToast(`Usuario ${user.firstName} ${user.lastName} ${stateText}`, 'success');
  }

  private showToast(message: string, type: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }
}
