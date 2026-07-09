package com.sis.backend.service;

import com.sis.backend.dto.DepartmentDto;
import com.sis.backend.dto.DepartmentInput;
import com.sis.backend.entity.Department;
import com.sis.backend.exception.BadRequestException;
import com.sis.backend.exception.NotFoundException;
import com.sis.backend.repository.DepartmentRepository;
import com.sis.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;

    public List<DepartmentDto> listDepartments() {
        return departmentRepository.findAll().stream().map(d -> {
            long students = studentRepository.countByDepartmentId(d.getId());
            long placed = studentRepository.countByDepartmentIdAndPlacementStatus(d.getId(), "PLACED");
            return DepartmentDto.from(d, (int) students, (int) placed);
        }).toList();
    }

    public DepartmentDto getDepartment(Long id) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        long students = studentRepository.countByDepartmentId(d.getId());
        long placed = studentRepository.countByDepartmentIdAndPlacementStatus(d.getId(), "PLACED");
        return DepartmentDto.from(d, (int) students, (int) placed);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentInput input) {
        if (departmentRepository.existsByCode(input.getCode())) {
            throw new BadRequestException("Department code already exists");
        }
        Department dept = new Department();
        dept.setName(input.getName());
        dept.setCode(input.getCode().toUpperCase());
        dept.setHeadName(input.getHeadName());
        dept = departmentRepository.save(dept);
        return DepartmentDto.from(dept, 0, 0);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentInput update) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        if (update.getName() != null) dept.setName(update.getName());
        if (update.getCode() != null) dept.setCode(update.getCode().toUpperCase());
        if (update.getHeadName() != null) dept.setHeadName(update.getHeadName());
        dept = departmentRepository.save(dept);
        long students = studentRepository.countByDepartmentId(id);
        long placed = studentRepository.countByDepartmentIdAndPlacementStatus(id, "PLACED");
        return DepartmentDto.from(dept, (int) students, (int) placed);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) throw new NotFoundException("Department not found");
        departmentRepository.deleteById(id);
    }
}
