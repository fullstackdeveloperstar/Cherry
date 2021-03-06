import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { StaffService } from '../../shared/services/staff.service';
import { Staff } from '../../shared/modules/staff.model';
import { ProfileService } from '../../shared/services/profile.service';
import { config } from '../../shared/modules/config.model';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-managestaff',
  templateUrl: './managestaff.component.html',
  styleUrls: ['./managestaff.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ManagestaffComponent implements OnInit {

  staffList = [];
  newStaff;
  editStaff;

  viewStatus = 0; // 0: list, 1: add, 2: edit
  confirmPassword = '';
  isNotPasswordMatched = false;

  constructor(
    private staffService: StaffService,
    private profileService: ProfileService
  ) {
    staffService.getStaffList().subscribe(data => {
      data['data'].map(staff => {
        staff['password'] = '';
        this.staffList.push(staff);
      });
    });
    // console.log(this.staffList);
  }

  ngOnInit() {
  }

  addnewStaff() {
    this.viewStatus = 1;
    this.newStaff = {
      name: '',
      email: '',
      phone: '',
      avartar: '../assets/default-user.png',
      description: '',
      role: 2,
      password: ''
    };
  }

  cancelStaffAdd() {
    this.viewStatus = 0;
  }

  editStaffClick(staffId) {
    this.viewStatus = 2;
    var me = this;
    this.staffList.map(staff => {
      if (staff.id === staffId) {
        me.editStaff = staff;
      }
    });
  }

  cancelStaffEdit() {
    this.viewStatus = 0;
  }

  clickAddNewStaff() {
    if (this.newStaff.password !== this.confirmPassword) {
      this.isNotPasswordMatched = true;
      return;
    }

    this.isNotPasswordMatched = false;
    this.confirmPassword = '';
    this.newStaff.password = Md5.hashStr(this.newStaff.password);
    this.staffService.addNewStaff(this.newStaff).subscribe(data => {
      this.viewStatus = 0;
      this.staffList = [];
      this.staffService.getStaffList().subscribe(data1 => {
        data1['data'].map(staff => {
          staff['password'] = '';
          this.staffList.push(staff);
        });
      });
    });
  }

  clickEditStaff() {
    var me = this;
    this.editStaff['password'] = Md5.hashStr(this.editStaff['password']);
    this.staffService.editStaff(this.editStaff).subscribe(data => {
      console.log(data);
      me.viewStatus = 0;
      this.editStaff['password'] = '';
    });
  }

  clickChangeAvartar() {
    document.getElementById('profile-imgage-upload').click();
  }

  fileChange(event) {
    var me = this;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('photo', file, file.name);

      this.profileService.uploadProfileImage(formData).subscribe((data: any) => {
        if (me.viewStatus === 1) {
          this.newStaff.avartar = config.baseURL + data.url;
        }

        if (me.viewStatus === 2) {
          this.editStaff.avartar = config.baseURL + data.url;
        }
      });
    }
  }

  deleteStaffClick(staffId) {
    var ok = confirm('Do you want to delete this Staff?');
    if (!ok) {
      return;
    }
    var me = this;
    this.staffService.deleteStaff(staffId).subscribe(data1 => {
      me.staffService.getStaffList().subscribe(data => {
        me.staffList = [];
        data['data'].map(staff => {
          staff['password'] = '';
          me.staffList.push(staff);
        });
      });
    });
  }
}
